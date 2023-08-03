'use strict';

const shopModel = require('../models/shop.model');
const bcrypt = require('bcrypt');
const crypto = require('node:crypto');
const KeyTokenService = require('./keyToken.service');
const { createTokenPair } = require('../auth/authUtils');
const { getInfoData } = require('../utils');

const RoleShop = {
  ADMIN: '00000',
  EDITOR: '00001',
  WRITER: '00002',
  SHOP: '00003',
};

class AccessService {
  static signUp = async ({ name, email, password }) => {
    try {
      // step 1: check email exists ?
      const hodelShop = await shopModel.findOne({ email }).lean();
      if (hodelShop) {
        return {
          code: 'xxx',
          message: 'Shop already registered!',
        };
      }

      // step 2: hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // step 3: create shop
      const newShop = await shopModel.create({
        name,
        email,
        password: passwordHash,
        roles: [RoleShop.SHOP],
      });

      // step 4: create token, refreshToken
      if (newShop) {
        // created privateKey, publicKey
        const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
          modulusLength: 4096,
          privateKeyEncoding: {
            type: 'pkcs1', // Public key CrytoGraphy standards 1
            format: 'pem',
          },
          publicKeyEncoding: {
            type: 'pkcs1', // Public key CrytoGraphy standards 1
            format: 'pem',
          },
        });

        // save publicKey in db
        const publicKeyString = await KeyTokenService.createKeyToken({
          userId: newShop._id,
          publicKey,
        });

        // check publicKeyString
        if (!publicKeyString) {
          return {
            code: 'xxx',
            message: 'publicKeyString error',
          };
        }

        // created token pair
        const tokens = await createTokenPair(
          { userId: newShop._id, email: newShop.email },
          privateKey,
        );

        return {
          code: 201,
          metadata: {
            shop: getInfoData({
              fields: ['_id', 'name', 'email'],
              object: newShop,
            }),
            tokens,
          },
        };
      }

      return {
        code: 200,
        metadata: null,
      };
    } catch (error) {
      return {
        code: 'xxx',
        message: error.message,
        status: 'error',
      };
    }
  };
}

module.exports = AccessService;
