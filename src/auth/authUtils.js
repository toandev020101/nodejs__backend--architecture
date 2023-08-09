'use strict';

const JWT = require('jsonwebtoken');
const asyncHandler = require('../helpers/asyncHandler');
const HEADER = require('../constants/header');
const { AuthFailureError, NotFoundError } = require('../core/error.response');
const KeyTokenService = require('../services/keyToken.service');

const createTokenPair = async ({ payload, privateKey, publicKey }) => {
  try {
    // accessToken
    const accessToken = await JWT.sign(payload, publicKey, {
      expiresIn: '2 days',
    });

    // refreshToken
    const refreshToken = await JWT.sign(payload, privateKey, {
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
   * 5 - check keyToken with userId
   * 6 - ok all => return next()
   */

  // check userId missing
  const userId = req.headers[HEADER.CLIENT_ID];
  if (!userId) {
    throw new AuthFailureError('Invalid request');
  }

  // get accessToken
  const keyToken = await KeyTokenService.findOneByUserId(userId);
  if (!keyToken) {
    throw new NotFoundError('Not found keyToken');
  }

  // check refresh token
  const refreshToken = req.headers[HEADER.REFRESH_TOKEN];
  if (refreshToken) {
    try {
      // verify token
      const decodeUser = JWT.verify(refreshToken, keyToken.privateKey);

      //check keyToken with userId
      if (userId !== decodeUser.userId) {
        throw new AuthFailureError('Invalid userId');
      }

      req.keyToken = keyToken;
      req.user = decodeUser;
      req.refreshToken = refreshToken;
      return next();
    } catch (error) {
      throw error;
    }
  }

  // check access token
  const accessToken = req.headers[HEADER.AUTHORIZATION];
  if (!accessToken) {
    throw new AuthFailureError('Invalid request');
  }

  try {
    // verify token
    const decodeUser = JWT.verify(accessToken, keyToken.publicKey);

    //check keyToken with userId
    if (userId !== decodeUser.userId) {
      throw new AuthFailureError('Invalid userId');
    }

    req.keyToken = keyToken;
    req.user = decodeUser;
    return next();
  } catch (error) {
    throw error;
  }
});

const verifyJWT = async ({ token, keySecret }) => {
  return await JWT.verify(token, keySecret);
};

module.exports = {
  createTokenPair,
  authentication,
  verifyJWT,
};
