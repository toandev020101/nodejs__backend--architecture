'use strict';

const { Types } = require('mongoose');
const inventoryModel = require('../inventory.model');

class InventoryRepository {
  static insert = async ({ productId, shopId, stock, location = 'unKnow' }) => {
    return await inventoryModel.create({
      inven_productId: new Types.ObjectId(productId),
      inven_shopId: new Types.ObjectId(shopId),
      inven_stock: stock,
      inven_location: location,
    });
  };
}

module.exports = InventoryRepository;
