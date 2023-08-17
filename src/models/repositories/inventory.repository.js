'use strict';

const { Types } = require('mongoose');
const inventoryModel = require('../inventory.model');
const { convertToObjectIdMongodb } = require('../../utils');

class InventoryRepository {
  static insert = async ({ productId, shopId, stock, location = 'unKnow' }) => {
    return await inventoryModel.create({
      inven_productId: new Types.ObjectId(productId),
      inven_shopId: new Types.ObjectId(shopId),
      inven_stock: stock,
      inven_location: location,
    });
  };

  static reservationInventory = async ({ productId, quantity, cartId }) => {
    const query = {
      inven_productId: convertToObjectIdMongodb(productId),
      inven_stock: { $gte: quantity },
    };

    const updateSet = {
      $inc: {
        inven_stock: -quantity,
      },
      $push: {
        inven_reservations: {
          quantity,
          cartId,
          createAt: new Date(),
        },
      },
    };

    return await inventoryModel.updateOne(query, updateSet);
  };
}

module.exports = InventoryRepository;
