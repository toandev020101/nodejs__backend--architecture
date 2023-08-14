'use strict';

const express = require('express');
const cartController = require('../../controllers/cart.controller');
const asyncHandler = require('../../helpers/asyncHandler');
const { authentication } = require('../../auth/authUtils');
const router = express.Router();

// authentication
// router.use(authentication);

router.post('/update', asyncHandler(cartController.updateCart));
router.post('', asyncHandler(cartController.addToCart));
router.delete('', asyncHandler(cartController.deleteCart));
router.get('', asyncHandler(cartController.listToCart));

module.exports = router;
