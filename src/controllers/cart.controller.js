'use strict';

const { SuccessResponse } = require('../core/success.response');
const CartService = require('../services/cart.service');

class CartController {
  /**
   * @desc add to cart for user
   * @param {int} userId
   * @method POST
   * @url /v1/api/cart/user
   * @return {
   *
   * }
   */

  addToCart = async (req, res, next) => {
    new SuccessResponse({
      message: 'create new Cart success!',
      metadata: await CartService.addToCart(req.body),
    }).send(res);
  };

  // update
  updateCart = async (req, res, next) => {
    new SuccessResponse({
      message: 'create new Cart success!',
      metadata: await CartService.addToCartV2(req.body),
    }).send(res);
  };

  // delete
  deleteCart = async (req, res, next) => {
    new SuccessResponse({
      message: 'deleted Cart success!',
      metadata: await CartService.deleteUserCart(req.body),
    }).send(res);
  };

  listToCart = async (req, res, next) => {
    new SuccessResponse({
      message: 'List Cart success!',
      metadata: await CartService.getListCart(req.query),
    }).send(res);
  };
}

module.exports = new CartController();
