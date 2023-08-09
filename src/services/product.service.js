'use strict';

const {
  productModel,
  clothingModel,
  electronicModel,
  furnitureModel,
} = require('../models/product.model');
const { BadRequestError } = require('../core/error.response');
const ProductRepository = require('../models/repositories/product.repository');
const { removeUndefinedObject, updateNestedObjectParser } = require('../utils');
const InventoryRepository = require('../models/repositories/inventory.repository');

// define Factory class to create product
class ProductFactory {
  /**
   * type: 'Clothing'
   * payload
   */
  static productRegistry = {}; // key-class

  static registerProductType(type, classRef) {
    ProductFactory.productRegistry[type] = classRef;
  }

  // POST

  static async createProduct({ type, payload }) {
    const productClass = ProductFactory.productRegistry[type];
    if (!productClass) {
      throw new BadRequestError(`Invalid Product Type ${type}`);
    }
    return new productClass(payload).createProduct();
  }

  static async updateProduct({ product_id, type, payload }) {
    const productClass = ProductFactory.productRegistry[type];
    if (!productClass) {
      throw new BadRequestError(`Invalid Product Type ${type}`);
    }
    return new productClass(payload).updateProduct({ product_id });
  }

  // END POST

  // GET

  static async findAllDraftsForShop({ product_shop, limit = 50, skip = 0 }) {
    const query = { product_shop, isDraft: true };
    return await ProductRepository.findAllDraftsForShop({ query, limit, skip });
  }

  static async findAllPublishForShop({ product_shop, limit = 50, skip = 0 }) {
    const query = { product_shop, isPublished: true };
    return await ProductRepository.findAllPublishForShop({
      query,
      limit,
      skip,
    });
  }

  static async searchProductByUser({ keySearch }) {
    return await ProductRepository.searchProductByUser({
      keySearch,
    });
  }

  static async findAllProducts({
    limit = 50,
    sort = 'ctime',
    page = 1,
    filter = { isPublished: true },
  }) {
    return await ProductRepository.findAllProducts({
      limit,
      sort,
      page,
      filter,
      select: ['product_name', 'product_price', 'product_thumb'],
    });
  }

  static async findProduct({ product_id }) {
    return await ProductRepository.findProduct({
      product_id,
      unSelect: ['__v'],
    });
  }

  // END GET

  // PATCH

  static async publishProductByShop({ product_shop, product_id }) {
    return await ProductRepository.publishProductByShop({
      product_shop,
      product_id,
    });
  }

  static async unPublishProductByShop({ product_shop, product_id }) {
    return await ProductRepository.unPublishProductByShop({
      product_shop,
      product_id,
    });
  }

  // END PATCH
}

// define base product class
class Product {
  constructor({
    product_name,
    product_thumb,
    product_description,
    product_price,
    product_quantity,
    product_type,
    product_shop,
    product_attributes,
  }) {
    this.product_name = product_name;
    this.product_thumb = product_thumb;
    this.product_description = product_description;
    this.product_price = product_price;
    this.product_quantity = product_quantity;
    this.product_type = product_type;
    this.product_shop = product_shop;
    this.product_attributes = product_attributes;
  }

  // create new product
  async createProduct(product_id) {
    const newProduct = await productModel.create({ ...this, _id: product_id });
    if (newProduct) {
      // add product_stock in inventory collection
      await InventoryRepository.insert({
        productId: newProduct._id,
        shopId: newProduct.product_shop,
        stock: newProduct.product_quantity,
      });
    }

    return newProduct;
  }

  // update product
  async updateProduct({ product_id, payload }) {
    return await ProductRepository.updateProductById({
      product_id,
      payload,
      model: productModel,
    });
  }
}

// define sub-class for different product types Clothing
class Clothing extends Product {
  async createProduct() {
    const newClothing = await clothingModel.create({
      ...this.product_attributes,
      product_shop: this.product_shop,
    });
    if (!newClothing) {
      throw new BadRequestError('Create new Clothing error!');
    }

    const newProduct = await super.createProduct(newClothing._id);
    if (!newProduct) {
      throw new BadRequestError('Create new Product error!');
    }

    return newProduct;
  }

  async updateProduct({ product_id }) {
    // remove attribute has null, underfined
    const objectParams = removeUndefinedObject(this);
    // check update in child
    if (objectParams.product_attributes) {
      // update child
      await ProductRepository.updateProductById({
        product_id,
        payload: updateNestedObjectParser(objectParams.product_attributes),
        model: clothingModel,
      });
    }

    const updateProduct = await super.updateProduct({
      product_id,
      payload: updateNestedObjectParser(objectParams),
    });

    return updateProduct;
  }
}

// define sub-class for different product types Electronics
class Electronics extends Product {
  async createProduct() {
    const newElectronic = await electronicModel.create({
      ...this.product_attributes,
      product_shop: this.product_shop,
    });
    if (!newElectronic) {
      throw new BadRequestError('Create new Electronics error!');
    }

    const newProduct = await super.createProduct(newElectronic._id);
    if (!newProduct) {
      throw new BadRequestError('Create new Product error!');
    }

    return newProduct;
  }

  async updateProduct({ product_id }) {
    // remove attribute has null, underfined
    const objectParams = removeUndefinedObject(this);
    // check update in child
    if (objectParams.product_attributes) {
      // update child
      await ProductRepository.updateProductById({
        product_id,
        payload: updateNestedObjectParser(objectParams.product_attributes),
        model: electronicModel,
      });
    }

    const updateProduct = await super.updateProduct({
      product_id,
      payload: updateNestedObjectParser(objectParams),
    });

    return updateProduct;
  }
}

// define sub-class for different product types Furniture
class Furniture extends Product {
  async createProduct() {
    const newFurniture = await furnitureModel.create({
      ...this.product_attributes,
      product_shop: this.product_shop,
    });
    if (!newFurniture) {
      throw new BadRequestError('Create new Furniture error!');
    }

    const newProduct = await super.createProduct(newFurniture._id);
    if (!newProduct) {
      throw new BadRequestError('Create new Product error!');
    }

    return newProduct;
  }

  async updateProduct({ product_id }) {
    // remove attribute has null, underfined
    const objectParams = removeUndefinedObject(this);
    // check update in child
    if (objectParams.product_attributes) {
      // update child
      await ProductRepository.updateProductById({
        product_id,
        payload: updateNestedObjectParser(objectParams.product_attributes),
        model: furnitureModel,
      });
    }

    const updateProduct = await super.updateProduct({
      product_id,
      payload: updateNestedObjectParser(objectParams),
    });

    return updateProduct;
  }
}

// register product types
ProductFactory.registerProductType('Clothing', Clothing);
ProductFactory.registerProductType('Electronics', Electronics);
ProductFactory.registerProductType('Furniture', Furniture);

module.exports = ProductFactory;
