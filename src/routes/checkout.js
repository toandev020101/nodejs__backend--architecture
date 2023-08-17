'use strict';

const express = require('express');
const checkoutController = require('../controllers/checkout.controller');
const asyncHandler = require('../helpers/asyncHandler');
const { authentication } = require('../auth/authUtils');
const router = express.Router();

// authentication
// router.use(authentication);

router.post('/review', asyncHandler(checkoutController.checkoutReview));

module.exports = router;
