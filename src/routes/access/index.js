'use strict';

const express = require('express');
const accessController = require('../../controllers/access.controller');
const asyncHandler = require('../../helpers/asyncHandler');
const { authentication } = require('../../auth/authUtils');
const router = express.Router();

router.post('/shop/signup', asyncHandler(accessController.signup));
router.post('/shop/login', asyncHandler(accessController.login));

// authentication
router.use(authentication);

router.get('/shop/logout', asyncHandler(accessController.logout));
router.get(
  '/shop/handleRefreshToken',
  asyncHandler(accessController.handleRefreshToken),
);

module.exports = router;
