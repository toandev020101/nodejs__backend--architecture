'use strict';

const cartModel = require('../models/cart.model');
const ProductRepository = require('../models/repositories/product.repository');
const { NotFoundError } = require('../core/error.response');
const { convertToObjectIdMongodb } = require('../utils');

/**
 * key features
 * - add product to cart [user]
 * - reduce product quantity by one [user]
 * - increase product quantity by one [user]
 * - get cart [user]
 * - delete cart [user]
 * - delete item cart [user]
 */

class CartService {
  static async findOneCartById(cartId) {
    return await cartModel
      .findOne({
        _id: convertToObjectIdMongodb(cartId),
        cart_state: 'active',
      })
      .lean();
  }

  static async createUserCart({ userId, product }) {
    const query = { cart_userId: +userId, cart_state: 'active' };
    const updateOrInsert = {
      $addToSet: {
        cart_products: product,
      },
    };
    const options = { upsert: true, new: true };

    return await cartModel.findOneAndUpdate(query, updateOrInsert, options);
  }

  static async updateUserCartQuantity({ userId, product }) {
    const { productId, quantity } = product;
    const query = {
      cart_userId: userId,
      cart_state: 'active',
      'cart_products.productId': productId,
    };

    const updateSet = {
      $inc: {
        'cart_products.$.quantity': quantity,
      },
    };
    const options = { upsert: true, new: true };

    return await cartModel.findOneAndUpdate(query, updateSet, options);
  }

  static async addToCart({ userId, product = {} }) {
    // check cart item
    const userCart = await cartModel.findOne({ cart_userId: userId });
    if (!userCart) {
      // create cart
      return await CartService.createUserCart({ userId, product });
    }

    // check cart empty
    if (userCart.cart_products.length === 0) {
      userCart.cart_products = [product];
      return userCart.save();
    }

    // update quantity
    return await CartService.updateUserCartQuantity({ userId, product });
  }

  static async addToCartV2({ userId, shop_order_ids }) {
    const { productId, quantity, old_quantity } =
      shop_order_ids[0]?.item_products[0];

    // check product exists
    const fountProduct = await ProductRepository.findProduct({
      product_id: productId,
      unSelect: ['__v'],
    });

    if (!fountProduct) {
      throw new NotFoundError('');
    }

    if (fountProduct.product_shop.toString() != shop_order_ids[0]?.shopId) {
      throw new NotFoundError('Product do not belong to the shop');
    }

    if (quantity === 0) {
      // deleted
    }

    return await CartService.updateUserCartQuantity({
      userId,
      product: {
        productId,
        quantity: quantity - old_quantity,
      },
    });
  }

  static async deleteUserCart({ userId, productId }) {
    const query = { cart_userId: +userId, cart_state: 'active' };
    const updateSet = {
      $pull: {
        cart_products: { productId },
      },
    };

    const deleteCart = await cartModel.updateOne(query, updateSet);
    return deleteCart;
  }

  static async getListCart({ userId }) {
    return await cartModel.findOne({ cart_userId: +userId }).lean();
  }
}

module.exports = CartService;
