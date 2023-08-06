'use strict';

const _ = require('lodash');
const crypto = require('node:crypto');

const getInfoData = ({ fields = [], object = {} }) => {
  return _.pick(object, fields);
};

const createKey = () => crypto.randomBytes(64).toString('hex');

module.exports = {
  getInfoData,
  createKey,
};
