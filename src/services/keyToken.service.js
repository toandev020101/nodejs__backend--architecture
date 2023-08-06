'use strict';

const keyTokenModel = require('../models/keyToken.model');
const { Types } = require('mongoose');

class KeyTokenService {
  static createKeyToken = async ({
    userId,
    privateKey,
    publicKey,
    refreshToken = null,
  }) => {
    try {
      // create keyToken
      const filter = { userId };
      const update = {
        privateKey,
        publicKey,
        refreshTokensUsed: [],
        refreshToken,
      };
      const options = { upsert: true, new: true };

      const keyToken = await keyTokenModel.findOneAndUpdate(
        filter,
        update,
        options,
      );

      return keyToken ? keyToken : null;
    } catch (error) {
      return error;
    }
  };

  static findOneByUserId = async (userId) => {
    return await keyTokenModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .lean();
  };

  static findOneByRefreshTokenUsed = async (refreshToken) => {
    return await keyTokenModel
      .findOne({ refreshTokensUsed: refreshToken })
      .lean();
  };

  static findOneByRefreshToken = async (refreshToken) => {
    return await keyTokenModel.findOne({ refreshToken }).lean();
  };

  static updateTokenById = async ({ id, refreshTokenUsed, refreshToken }) => {
    try {
      // update keyToken
      const filter = { _id: id };
      const update = {
        $set: {
          refreshToken,
        },
        $addToSet: {
          refreshTokensUsed: refreshTokenUsed,
        },
      };
      const options = { upsert: true, new: true };

      await keyTokenModel.findOneAndUpdate(filter, update, options);
    } catch (error) {
      return error;
    }
  };

  static removeOneById = async (id) => {
    return await keyTokenModel.deleteOne(id);
  };

  static removeOneByUserId = async (userId) => {
    return await keyTokenModel.deleteOne({ userId });
  };
}

module.exports = KeyTokenService;
