'use strict';

const { BadRequestError } = require('../core/error.response');
const orderModel = require('../models/order.model');
const ProductRepository = require('../models/repositories/product.repository');
const CartService = require('./cart.service');
const DiscountService = require('./discount.service');
const RedisService = require('./redis.service');

class CheckoutService {
  /**
   * {
   *  cartId,
   *  userId,
   *  shop_order_ids: [
   *    {
   *      shopId,
   *      shop_discounts: [
   *        {
   *          "shopId",
   *          "discountId",
   *          "codeId"
   *         }
   *      ],
   *      item_products: [
   *        {
   *          price,
   *          quantity,
   *          productId
   *        }
   *      ]
   *    }
   *  ]
   * }
   */

  static async checkoutReview({ cartId, userId, shop_order_ids = [] }) {
    // check cartId exists?
    const foundCart = await CartService.findOneCartById(cartId);
    if (!foundCart) {
      throw new BadRequestError('Cart does not exists!');
    }

    const checkout_order = {
      totalPrice: 0,
      feeShip: 0,
      totalDiscount: 0,
      totalCheckout: 0,
    };

    const shop_order_ids_new = [];

    // sum bill
    for (let i = 0; i < shop_order_ids.length; i++) {
      const {
        shopId,
        shop_discounts = [],
        item_products = [],
      } = shop_order_ids[i];

      // check product available
      const checkProductServer = await ProductRepository.checkProductByServer(
        item_products,
      );

      if (!checkProductServer[0]) {
        throw new BadRequestError('Order wrong!');
      }

      // tong tien don hang
      const checkoutPrice = checkProductServer.reduce((total, product) => {
        return total + product.price * product.quantity;
      }, 0);

      // tong tien truoc khi xu ly
      checkout_order.totalPrice += checkoutPrice;

      const itemCheckout = {
        shopId,
        shop_discounts,
        priceRaw: checkoutPrice, // tien truoc khi giam gia
        priceApplyDiscount: checkoutPrice,
        item_products: checkProductServer,
      };

      // check discount
      if (shop_discounts.length > 0) {
        // co 1 discount
        const { totalPrice = 0, discount = 0 } =
          await DiscountService.getDiscountAmount({
            codeId: shop_discounts[0].codeId,
            userId,
            shopId,
            products: checkProductServer,
          });

        // tong cong discount
        checkout_order.totalDiscount += discount;

        if (discount > 0) {
          itemCheckout.priceApplyDiscount = checkoutPrice - discount;
        }
      }

      // tong thanh toan
      checkout_order.totalCheckout += itemCheckout.priceApplyDiscount;
      shop_order_ids_new.push(itemCheckout);
    }

    return {
      shop_order_ids,
      shop_order_ids_new,
      checkout_order,
    };
  }

  static async orderByUser({
    shop_order_ids,
    cartId,
    userId,
    user_address = {},
    user_payment = {},
  }) {
    const { shop_order_ids_new, checkout_order } =
      await CheckoutService.checkoutReview({
        cartId,
        userId,
        shop_order_ids,
      });

    // check ton kho
    // get new array product
    const products = shop_order_ids_new.flatMap((order) => order.item_products);

    const acquireProduct = [];

    for (let i = 0; i < products.length; i++) {
      const { productId, quantity } = products[i];
      const keyLock = await RedisService.acquireLock(
        productId,
        quantity,
        cartId,
      );

      acquireProduct.push(keyLock ? true : false);
      if (keyLock) {
        await RedisService.releaseLock(keyLock);
      }
    }

    // check lai neu co mot san pham het hang trong kho
    if (acquireProduct.includes(false)) {
      throw new BadRequestError(
        'Mot so san pham da duoc cap nhat, vui long quay lai gio hang ...',
      );
    }

    const newOrder = await orderModel.create({
      order_userId: userId,
      order_checkout: checkout_order,
      order_shipping: user_address,
      order_payment: user_payment,
      order_products: shop_order_ids_new,
    });

    if (newOrder) {
      // remove product in cart
    }

    return newOrder;
  }

  static async getOrdersByUser() {}
  static async getOneOrderByUser() {}
  static async cancelOrderByUser() {}
  static async updateOrderStatusByShop() {}
}

module.exports = CheckoutService;
