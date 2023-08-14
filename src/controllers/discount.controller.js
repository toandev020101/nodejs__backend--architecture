'use strict';

const { CREATED, OK } = require('../core/success.response');
const DiscountService = require('../services/discount.service');

class DiscountController {
  createDiscountCode = async (req, res, next) => {
    new CREATED({
      message: 'Successful code generations',
      metadata: await DiscountService.createDiscountCode({
        ...req.body,
        shopId: req.user.userId,
      }),
    }).send(res);
  };

  getAllDiscountCodes = async (req, res, next) => {
    new OK({
      message: 'Successful code found',
      metadata: await DiscountService.getAllDiscountCodeByShop({
        ...req.query,
        shopId: req.user.userId,
      }),
    }).send(res);
  };

  getAllDiscountAmount = async (req, res, next) => {
    new OK({
      message: 'Successful code found',
      metadata: await DiscountService.getDiscountAmount({
        ...req.body,
      }),
    }).send(res);
  };

  getAllDiscountCodesWithProducts = async (req, res, next) => {
    new OK({
      message: 'Successful code found',
      metadata: await DiscountService.getAllDiscountCodesWithProduct({
        ...req.query,
      }),
    }).send(res);
  };
}

module.exports = new DiscountController();
