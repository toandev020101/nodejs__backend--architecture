'use strict';

const { Types } = require('mongoose');
const { productModel } = require('../product.model');
const { getSelectData, getUnSelectData } = require('../../utils');

class ProductRepository {
  // GET
  static queryProduct = async ({ query, limit, skip }) => {
    return await productModel
      .find(query)
      .populate('product_shop', 'name email -_id')
      .sort({ updateAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();
  };
  static findAllDraftsForShop = async ({ query, limit, skip }) => {
    return await ProductRepository.queryProduct({ query, limit, skip });
  };

  static findAllPublishForShop = async ({ query, limit, skip }) => {
    return await ProductRepository.queryProduct({ query, limit, skip });
  };

  static searchProductByUser = async ({ keySearch }) => {
    const regexSearch = new RegExp(keySearch);
    const results = await productModel
      .find(
        {
          isPublished: true,
          $text: { $search: regexSearch },
        },
        { score: { $meta: 'textScore' } },
      )
      .sort({ score: { $meta: 'textScore' } })
      .lean();
    return results;
  };

  static findAllProducts = async ({ limit, sort, page, filter, select }) => {
    const skip = (page - 1) * limit;
    const sortBy = sort === 'ctime' ? { _id: -1 } : { id: 1 };
    const products = await productModel
      .find(filter)
      .sort(sortBy)
      .skip(skip)
      .limit(limit)
      .select(getSelectData(select))
      .lean();

    return products;
  };

  static findProduct = async ({ product_id, unSelect }) => {
    return await productModel
      .findOne({ _id: new Types.ObjectId(product_id) })
      .select(getUnSelectData(unSelect));
  };

  // END GET

  // PATCH

  static publishProductByShop = async ({ product_shop, product_id }) => {
    const filter = {
      product_shop: new Types.ObjectId(product_shop),
      _id: new Types.ObjectId(product_id),
    };

    const update = {
      isDraft: false,
      isPublished: true,
    };

    const { modifiedCount } = await productModel
      .updateOne(filter, update)
      .lean();
    return modifiedCount;
  };

  static unPublishProductByShop = async ({ product_shop, product_id }) => {
    const filter = {
      product_shop: new Types.ObjectId(product_shop),
      _id: new Types.ObjectId(product_id),
    };

    const update = {
      isDraft: true,
      isPublished: false,
    };

    const { modifiedCount } = await productModel
      .updateOne(filter, update)
      .lean();
    return modifiedCount;
  };

  static updateProductById = async ({
    product_id,
    payload,
    model,
    isNew = true,
  }) => {
    return await model
      .findOneAndUpdate({ _id: new Types.ObjectId(product_id) }, payload, {
        new: isNew,
      })
      .lean();
  };

  // END PATCH
}

module.exports = ProductRepository;
