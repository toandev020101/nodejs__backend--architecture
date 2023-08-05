'use strict';

const shopModel = require('../models/shop.model');
const bcrypt = require('bcrypt');
const crypto = require('node:crypto');
const KeyTokenService = require('./keyToken.service');
const { createTokenPair } = require('../auth/authUtils');
const { getInfoData } = require('../utils');
const { BadRequestError, AuthFailureError } = require('../core/error.response');
const ShopService = require('./shop.service');
const ROLE_SHOP = require('../constants/role');

class AccessService {
  static signUp = async ({ name, email, password }) => {
    // step 1: check email exists ?
    const hodelShop = await shopModel.findOne({ email }).lean();
    if (hodelShop) {
      throw new BadRequestError('Error: Shop already registered!');
    }

    // step 2: hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // step 3: create shop
    const newShop = await shopModel.create({
      name,
      email,
      password: passwordHash,
      roles: [ROLE_SHOP.SHOP],
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
        throw new BadRequestError('Error: publicKeyString error!');
      }

      // created token pair
      const tokens = await createTokenPair(
        { userId: newShop._id, email: newShop.email },
        privateKey,
      );

      if (!tokens) {
        throw new BadRequestError('Token not sign!');
      }

      return {
        shop: getInfoData({
          fields: ['_id', 'name', 'email'],
          object: newShop,
        }),
        tokens,
      };
    }

    return;
  };

  static login = async ({ email, password, refreshToken = null }) => {
    // check email
    const foundShop = await ShopService.findByEmail({ email });
    if (!foundShop) {
      throw new BadRequestError('Shop not registered!');
    }

    // match password
    const matchPassword = bcrypt.compare(password, foundShop.password);
    if (!matchPassword) {
      throw new AuthFailureError('Authentication error!');
    }

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

    // created token pair
    const { _id: userId } = foundShop;
    const tokens = await createTokenPair(
      { userId, email: foundShop.email },
      privateKey,
    );

    if (!tokens) {
      throw new BadRequestError('Token not sign!');
    }

    await KeyTokenService.createKeyToken({
      userId,
      publicKey,
      refreshToken: tokens.refreshToken,
    });

    return {
      shop: getInfoData({
        fields: ['_id', 'name', 'email'],
        object: foundShop,
      }),
      tokens,
    };
  };

  static logout = async (keyStore) => {
    const delKey = await KeyTokenService.removeOneById(keyStore._id);
    console.log(delKey);
    return delKey;
  };
}

module.exports = AccessService;
