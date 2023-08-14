'use strict';

const { BadRequestError, NotFoundError } = require('../core/error.response');
const discountModel = require('../models/discount.model');
const { convertToObjectIdMongodb } = require('../utils');
const ProductRepository = require('../models/repositories/product.repository');
const DiscountRepository = require('../models/repositories/discount.repository');

/**
 * discount service
 * 1 - Generator Discount Code [Shop | Admin]
 * 2 - Get discount amount [User]
 * 3 - Get all discount codes [User | Shop]
 * 4 - Verify discount code [User]
 * 5 - Delete discount code [Admin | Shop]
 * 6 - Cancel discount code [User]
 */

class DiscountService {
  static async createDiscountCode(payload) {
    const {
      code,
      startDate,
      endDate,
      isActive,
      shopId,
      minOrderValue,
      productIds,
      appliesTo,
      name,
      description,
      type,
      value,
      maxValue,
      maxUses,
      usesCount,
      maxUsesPerUser,
      usersUsed,
    } = payload;

    // check data
    // if (new Date() < new Date(startDate) || new Date() > new Date(endDate)) {
    //   throw new BadRequestError('Discount code has expried!');
    // }

    if (new Date(startDate) > new Date(endDate)) {
      throw new BadRequestError('Start date must be before end date');
    }

    // create index for discount code
    const foundDiscount = await discountModel
      .findOne({
        discount_code: code,
        discount_shopId: convertToObjectIdMongodb(shopId),
      })
      .lean();

    if (foundDiscount && foundDiscount.discount_is_active) {
      throw new BadRequestError('Discount exists!');
    }

    const newDiscount = await discountModel.create({
      discount_name: name,
      discount_description: description,
      discount_type: type,
      discount_code: code,
      discount_value: value,
      discount_min_order_value: minOrderValue,
      discount_max_value: maxValue,
      discount_start_date: startDate,
      discount_end_date: endDate,
      discount_max_uses: maxUses,
      discount_uses_count: usesCount,
      discount_users_used: usersUsed,
      discount_shopId: convertToObjectIdMongodb(shopId),
      discount_max_uses_per_user: maxUsesPerUser,
      discount_is_active: isActive,
      discount_applies_to: appliesTo,
      discount_product_ids: appliesTo === 'all' ? [] : productIds,
    });

    return newDiscount;
  }

  static async updateDiscountCode() {}

  // get all discount codes available with products
  static async getAllDiscountCodesWithProduct({
    code,
    shopId,
    userId,
    limit,
    page,
  }) {
    // create index for discount_code
    const foundDiscount = await discountModel
      .findOne({
        discount_code: code,
        discount_shopId: convertToObjectIdMongodb(shopId),
      })
      .lean();

    if (!foundDiscount || !foundDiscount.discount_is_active) {
      throw new NotFoundError('Discount not exists!');
    }

    const { discount_applies_to, discount_product_ids } = foundDiscount;

    let products;
    if (discount_applies_to === 'all') {
      // get all product
      products = await ProductRepository.findAllProducts({
        filter: {
          product_shop: convertToObjectIdMongodb(shopId),
          isPublished: true,
        },
        limit: +limit,
        page: +page,
        sort: 'ctime',
        select: ['product_name'],
      });
    }

    if (discount_applies_to === 'specific') {
      // get product ids
      products = await ProductRepository.findAllProducts({
        filter: {
          _id: { $in: discount_product_ids },
          isPublished: true,
        },
        limit: +limit,
        page: +page,
        sort: 'ctime',
        select: ['product_name'],
      });
    }

    return products;
  }

  // get all discount code of shop
  static async getAllDiscountCodeByShop({ limit, page, shopId }) {
    const discounts = await DiscountRepository.findAllDiscountCodesUnSelect({
      limit: +limit,
      page: +page,
      filter: {
        discount_shopId: convertToObjectIdMongodb(shopId),
        discount_is_active: true,
      },
      unSelect: ['__v', 'discount_shopId'],
    });

    return discounts;
  }

  // apply discount code
  static async getDiscountAmount({ codeId, userId, shopId, products }) {
    // create index for discount_code
    const foundDiscount = await discountModel
      .findOne({
        discount_code: codeId,
        discount_shopId: convertToObjectIdMongodb(shopId),
      })
      .lean();

    if (!foundDiscount) {
      throw new NotFoundError(`Discount doesn't exists`);
    }

    const {
      discount_is_active,
      discount_max_uses,
      discount_start_date,
      discount_end_date,
      discount_min_order_value,
      discount_max_uses_per_user,
      discount_users_used,
      discount_type,
      discount_value,
    } = foundDiscount;
    if (!discount_is_active) {
      throw new BadRequestError(`Discount expried!`);
    }
    if (!discount_max_uses) {
      throw new BadRequestError(`Discount are out!`);
    }
    // if (
    //   new Date() < new Date(discount_start_date) ||
    //   new Date() > new Date(discount_end_date)
    // ) {
    //   throw new BadRequestError(`Discount expried!`);
    // }

    let totalOrder = 0;
    if (discount_min_order_value > 0) {
      // get total
      totalOrder = products.reduce((total, product) => {
        return total + product.quantity * product.price;
      }, 0);

      if (totalOrder < discount_min_order_value) {
        throw new BadRequestError(
          `discount requires a minium order value of ${discount_min_order_value}`,
        );
      }
    }

    if (discount_max_uses_per_user > 0) {
      const userUsedDiscount = discount_users_used.find(
        (user) => user.userId === userId,
      );

      if (
        userUsedDiscount &&
        userUsedDiscount.count >= discount_max_uses_per_user
      ) {
        throw new BadRequestError('User not use discount');
      }
    }

    const amount =
      discount_type === 'fixed_amount'
        ? discount_value
        : totalOrder * (discount_value / 100);

    return {
      totalOrder,
      discount: amount,
      totalPrice: totalOrder - amount,
    };
  }

  static async deleteDiscountCode({ shopId, codeId }) {
    const deleted = await discountModel.findOneAndDelete({
      discount_code: codeId,
      discount_shopId: convertToObjectIdMongodb(shopId),
    });

    return deleted;
  }

  static async cancelDiscountCode({ codeId, shopId, userId }) {
    // create index for discount_code
    const foundDiscount = await discountModel
      .findOne({
        discount_code: code,
        discount_shopId: convertToObjectIdMongodb(shopId),
      })
      .lean();

    if (!foundDiscount) {
      throw new NotFoundError(`Discount doesn't exists`);
    }

    const result = await discountModel.findOneAndUpdate(
      { _id: foundDiscount._id },
      {
        $pull: {
          discount_users_used: userId,
        },
        $inc: {
          discount_max_uses: 1,
          discount_uses_count: -1,
        },
      },
    );

    return result;
  }
}

module.exports = DiscountService;
