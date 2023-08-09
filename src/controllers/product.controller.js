'use strict';

const { CREATED, OK } = require('../core/success.response');
const ProductService = require('../services/product.service');

class ProductController {
  // POST
  createProduct = async (req, res, next) => {
    new CREATED({
      message: 'Create Product OK!',
      metadata: await ProductService.createProduct({
        type: req.body.product_type,
        payload: { ...req.body, product_shop: req.user.userId },
      }),
    }).send(res);
  };

  // END POST

  // GET

  /**
   * @desc Get all Drafts for shop
   * @param {String} product_shop
   * @param {Number} limit
   * @param {Number} skip
   * @return {JSON}
   */
  getAllDraftsForShop = async (req, res, next) => {
    new OK({
      message: 'Get List Product Draft OK!',
      metadata: await ProductService.findAllDraftsForShop({
        product_shop: req.user.userId,
      }),
    }).send(res);
  };

  /**
   * @desc Get all Published for shop
   * @param {String} product_shop
   * @param {Number} limit
   * @param {Number} skip
   * @return {JSON}
   */
  getAllPublishForShop = async (req, res, next) => {
    new OK({
      message: 'Get List Product Published OK!',
      metadata: await ProductService.findAllPublishForShop({
        product_shop: req.user.userId,
      }),
    }).send(res);
  };

  /**
   * @desc Get List Search Product Published for shop
   * @param {String} product_shop
   * @param {Number} limit
   * @param {Number} skip
   * @return {JSON}
   */
  getListSearchProduct = async (req, res, next) => {
    new OK({
      message: 'Get List Search Product Published OK!',
      metadata: await ProductService.searchProductByUser({
        keySearch: req.params.keySearch,
      }),
    }).send(res);
  };

  /**
   * @desc Get All Product Published
   * @param {Number} page
   * @param {Number} limit
   * @param {Number} skip
   * @return {JSON}
   */
  getAllProducts = async (req, res, next) => {
    new OK({
      message: 'Get All Product Published OK!',
      metadata: await ProductService.findAllProducts(req.params),
    }).send(res);
  };

  /**
   * @desc Get All Product Published
   * @param {String} product_id
   * @return {JSON}
   */
  getProduct = async (req, res, next) => {
    new OK({
      message: 'Get All Product Published OK!',
      metadata: await ProductService.findProduct({
        product_id: req.params.id,
      }),
    }).send(res);
  };

  // END GET

  // PATCH

  /**
   * @desc Published for shop
   * @param {String} product_shop
   * @param {String} product_id
   * @param {Number} limit
   * @param {Number} skip
   * @return {JSON}
   */
  publishProductByShop = async (req, res, next) => {
    new OK({
      message: 'Published Product OK!',
      metadata: await ProductService.publishProductByShop({
        product_shop: req.user.userId,
        product_id: req.params.id,
      }),
    }).send(res);
  };

  /**
   * @desc UnPublished for shop
   * @param {String} product_shop
   * @param {String} product_id
   * @param {Number} limit
   * @param {Number} skip
   * @return {JSON}
   */
  unPublishProductByShop = async (req, res, next) => {
    new OK({
      message: 'UnPublished Product OK!',
      metadata: await ProductService.unPublishProductByShop({
        product_shop: req.user.userId,
        product_id: req.params.id,
      }),
    }).send(res);
  };

  updateProduct = async (req, res, next) => {
    new OK({
      message: 'Update Product OK!',
      metadata: await ProductService.updateProduct({
        product_id: req.params.id,
        type: req.body.product_type,
        payload: { ...req.body, product_shop: req.user.userId },
      }),
    }).send(res);
  };

  // END PATCH
}

module.exports = new ProductController();
