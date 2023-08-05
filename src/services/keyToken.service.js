'use strict';

const keyTokenModel = require('../models/keyToken.model');
const { Types } = require('mongoose');

class KeyTokenService {
  static createKeyToken = async ({ userId, publicKey, refreshToken }) => {
    try {
      // convert to string
      const publicKeyString = publicKey.toString();

      // create keyToken
      const filter = { userId };
      const update = {
        publicKey: publicKeyString,
        refreshTokensUsed: [],
        refreshToken,
      };
      const options = { upsert: true, new: true };

      const tokens = await keyTokenModel.findOneAndUpdate(
        filter,
        update,
        options,
      );

      return tokens ? tokens.publicKey : null;
    } catch (error) {
      return error;
    }
  };

  static findOneByUserId = async (userId) => {
    return await keyTokenModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .lean();
  };

  static removeOneById = async (id) => {
    return await keyTokenModel.deleteOne(id);
  };
}

module.exports = KeyTokenService;
