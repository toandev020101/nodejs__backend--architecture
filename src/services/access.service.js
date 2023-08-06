'use strict';

const shopModel = require('../models/shop.model');
const bcrypt = require('bcrypt');
const KeyTokenService = require('./keyToken.service');
const { createTokenPair, verifyJWT } = require('../auth/authUtils');
const { getInfoData, createKey } = require('../utils');
const {
  BadRequestError,
  AuthFailureError,
  ForbiddenError,
} = require('../core/error.response');
const ShopService = require('./shop.service');
const ROLE_SHOP = require('../constants/role');

class AccessService {
  static signup = async ({ name, email, password }) => {
    // step 1: check email exists ?
    const holderShop = await shopModel.findOne({ email }).lean();
    if (holderShop) {
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
      const privateKey = createKey();
      const publicKey = createKey();

      // save private, publicKey in db
      const keyToken = await KeyTokenService.createKeyToken({
        userId: newShop._id,
        privateKey,
        publicKey,
      });

      // check keyToken
      if (!keyToken) {
        throw new BadRequestError('Error: keyToken error!');
      }

      // created token pair
      const tokens = await createTokenPair({
        payload: { userId: newShop._id, email: newShop.email },
        privateKey,
        publicKey,
      });

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
    const foundShop = await ShopService.findOneByEmail({ email });
    if (!foundShop) {
      throw new BadRequestError('Shop not registered!');
    }

    // match password
    const matchPassword = bcrypt.compare(password, foundShop.password);
    if (!matchPassword) {
      throw new AuthFailureError('Authentication error!');
    }

    // created privateKey, publicKey
    const privateKey = createKey();
    const publicKey = createKey();

    // created token pair
    const { _id: userId } = foundShop;
    const tokens = await createTokenPair({
      payload: { userId, email: foundShop.email },
      privateKey,
      publicKey,
    });

    if (!tokens) {
      throw new BadRequestError('Token not sign!');
    }

    await KeyTokenService.createKeyToken({
      userId,
      privateKey,
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

  static logout = async (keyToken) => {
    const delKey = await KeyTokenService.removeOneById(keyToken._id);
    console.log(delKey);
    return delKey;
  };

  static handleRefreshToken = async ({ refreshToken, user, keyToken }) => {
    const { userId, email } = user;

    // check this token used
    if (keyToken.refreshTokensUsed.includes(refreshToken)) {
      // delete all token in keyToken
      await KeyTokenService.removeOneByUserId(userId);
      throw new ForbiddenError('Something wrong happend! PLS reLogin');
    }

    // check refreshToken in keyToken
    if (keyToken.refreshToken !== refreshToken) {
      throw new AuthFailureError('Shop not registered!');
    }

    // check userId
    const foundShop = await ShopService.findOneByEmail({ email });
    if (!foundShop) {
      throw new AuthFailureError('Shop not registered!');
    }

    // create token new
    const tokens = await createTokenPair({
      payload: { userId, email },
      privateKey: keyToken.privateKey,
      publicKey: keyToken.publicKey,
    });

    // update token
    await KeyTokenService.updateTokenById({
      id: keyToken._id,
      refreshToken: tokens.refreshToken,
      refreshTokenUsed: refreshToken,
    });

    return {
      user,
      tokens,
    };
  };
}

module.exports = AccessService;
