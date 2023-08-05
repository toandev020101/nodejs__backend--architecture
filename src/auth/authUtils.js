'use strict';

const JWT = require('jsonwebtoken');
const asyncHandler = require('../helpers/asyncHandler');
const HEADER = require('../constants/header');
const { AuthFailureError, NotFoundError } = require('../core/error.response');
const KeyTokenService = require('../services/keyToken.service');

const createTokenPair = async (payload, privateKey) => {
  try {
    // accessToken
    const accessToken = await JWT.sign(payload, privateKey, {
      algorithm: 'RS256',
      expiresIn: '2 days',
    });

    // refreshToken
    const refreshToken = await JWT.sign(payload, privateKey, {
      algorithm: 'RS256',
      expiresIn: '7 days',
    });

    return { accessToken, refreshToken };
  } catch (error) {
    return null;
  }
};

const authentication = asyncHandler(async (req, res, next) => {
  /**
   * 1 - check userId missing??
   * 2 - get accessToken
   * 3 - verify token
   * 4 - check user in db
   * 5 - check keystore with userId
   * 6 - ok all => return next()
   */

  // check userId missing
  const userId = req.headers[HEADER.CLIENT_ID];
  if (!userId) {
    throw new AuthFailureError('Invalid request');
  }

  // get accessToken
  const keyStore = await KeyTokenService.findOneByUserId(userId);
  if (!keyStore) {
    throw new NotFoundError('Not found keyStore');
  }

  const accessToken = req.headers[HEADER.AUTHORIZATION];
  if (!accessToken) {
    throw new AuthFailureError('Invalid request');
  }

  try {
    // verify token
    const decodeUser = JWT.verify(accessToken, keyStore.publicKey);

    //check keystore with userId
    if (userId !== decodeUser.userId) {
      throw new AuthFailureError('Invalid userId');
    }

    req.keyStore = keyStore;
    return next();
  } catch (error) {
    throw error;
  }
});

module.exports = {
  createTokenPair,
  authentication,
};
