'use strict';

const { getUnSelectData, getSelectData } = require('../../utils');
const discountModel = require('../discount.model');

class DiscountRepository {
  static findAllDiscountCodesUnSelect = async ({
    limit = 50,
    page = 1,
    sort = 'ctime',
    filter,
    unSelect,
  }) => {
    const skip = (page - 1) * limit;
    const sortBy = sort === 'ctime' ? { _id: -1 } : { id: 1 };
    const discounts = await discountModel
      .find(filter)
      .sort(sortBy)
      .skip(skip)
      .limit(limit)
      .select(getUnSelectData(unSelect))
      .lean();

    return discounts;
  };

  static findAllDiscountCodesSelect = async ({
    limit = 50,
    page = 1,
    sort = 'ctime',
    filter,
    unSelect,
  }) => {
    const skip = (page - 1) * limit;
    const sortBy = sort === 'ctime' ? { _id: -1 } : { id: 1 };
    const discounts = await discountModel
      .find(filter)
      .sort(sortBy)
      .skip(skip)
      .limit(limit)
      .select(getSelectData(select))
      .lean();

    return discounts;
  };
}

module.exports = DiscountRepository;
