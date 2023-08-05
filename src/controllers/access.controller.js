'use strict';

const { CREATED, OK } = require('../core/success.response');
const AccessService = require('../services/access.service');

class AccessController {
  signUp = async (req, res, next) => {
    new CREATED({
      message: 'Registered OK!',
      metadata: await AccessService.signUp(req.body),
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
      metadata: await AccessService.logout(req.keyStore),
    }).send(res);
  };
}

module.exports = new AccessController();
