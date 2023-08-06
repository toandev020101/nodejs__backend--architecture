'use strict';

const { CREATED, OK } = require('../core/success.response');
const AccessService = require('../services/access.service');

class AccessController {
  signup = async (req, res, next) => {
    new CREATED({
      message: 'Registered OK!',
      metadata: await AccessService.signup(req.body),
    }).send(res);
  };

  login = async (req, res, next) => {
    new OK({
      message: 'Login OK!',
      metadata: await AccessService.login(req.body),
    }).send(res);
  };

  logout = async (req, res, next) => {
    new OK({
      message: 'Logout OK!',
      metadata: await AccessService.logout(req.keyToken),
    }).send(res);
  };

  handleRefreshToken = async (req, res, next) => {
    new OK({
      message: 'Get Token OK!',
      metadata: await AccessService.handleRefreshToken({
        refreshToken: req.refreshToken,
        user: req.user,
        keyToken: req.keyToken,
      }),
    }).send(res);
  };
}

module.exports = new AccessController();
