'use strict';

const express = require('express');
const discountController = require('../../controllers/discount.controller');
const asyncHandler = require('../../helpers/asyncHandler');
const { authentication } = require('../../auth/authUtils');
const router = express.Router();

router.post('/amount', asyncHandler(discountController.getAllDiscountAmount));
router.get(
  '/listProductCode',
  asyncHandler(discountController.getAllDiscountCodesWithProducts),
);

// authentication
router.use(authentication);

router.post('', asyncHandler(discountController.createDiscountCode));
router.get('', asyncHandler(discountController.getAllDiscountCodes));

module.exports = router;
