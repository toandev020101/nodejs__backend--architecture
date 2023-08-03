'use strict';

const keyTokenModel = require('../models/keyToken.model');

class KeyTokenService {
  static createKeyToken = async ({ userId, publicKey }) => {
    try {
      // convert to string
      const publicKeyString = publicKey.toString();

      // create keyToken
      const tokens = await keyTokenModel.create({
        userId,
        publicKey: publicKeyString,
      });

      return tokens ? tokens.publicKey : null;
    } catch (error) {
      return error;
    }
  };
}

module.exports = KeyTokenService;
