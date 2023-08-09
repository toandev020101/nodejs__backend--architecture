'use strict';

const _ = require('lodash');
const crypto = require('node:crypto');

const getInfoData = ({ fields = [], object = {} }) => {
  return _.pick(object, fields);
};

const createKey = () => crypto.randomBytes(64).toString('hex');

// ['a', 'b'] = {a: 1, b: 1}
const getSelectData = (select = []) => {
  return Object.fromEntries(select.map((el) => [el, 1]));
};

// ['a', 'b'] = {a: 0, b: 0}
const getUnSelectData = (select = []) => {
  return Object.fromEntries(select.map((el) => [el, 0]));
};

const removeUndefinedObject = (obj) => {
  Object.keys(obj).forEach((key) => {
    if (obj[key] === null) {
      delete obj[key];
    }
  });

  return obj;
};

/**
 * const a = {
 *  c: {
 *      d: 1,
 *      e: 2
 *     }
 * }
 *
 * => {
 *      `c.d`: 1,
 *      `c.e`: 2
 *    }
 */
const updateNestedObjectParser = (obj) => {
  const final = {};
  Object.keys(obj).forEach((key) => {
    if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
      const response = updateNestedObjectParser(obj[key]);
      Object.keys(response).forEach((rKey) => {
        final[`${key}.${rKey}`] = response[rKey];
      });
    } else {
      final[key] = obj[key];
    }
  });

  return final;
};

module.exports = {
  getInfoData,
  createKey,
  getSelectData,
  getUnSelectData,
  removeUndefinedObject,
  updateNestedObjectParser,
};
