'use strict';

const express = require('express');
const productController = require('../../controllers/product.controller');
const asyncHandler = require('../../helpers/asyncHandler');
const { authentication } = require('../../auth/authUtils');
const router = express.Router();

router.get(
  '/search/:keySearch',
  asyncHandler(productController.getListSearchProduct),
);
router.get('/:id', asyncHandler(productController.getProduct));
router.get('', asyncHandler(productController.getAllProducts));

// authentication
router.use(authentication);

router.post('', asyncHandler(productController.createProduct));

router.get('/draft/all', asyncHandler(productController.getAllDraftsForShop));
router.get(
  '/published/all',
  asyncHandler(productController.getAllPublishForShop),
);

router.patch(
  '/publish/:id',
  asyncHandler(productController.publishProductByShop),
);
router.patch(
  '/unpublish/:id',
  asyncHandler(productController.unPublishProductByShop),
);
router.patch('/:id', asyncHandler(productController.updateProduct));

module.exports = router;
