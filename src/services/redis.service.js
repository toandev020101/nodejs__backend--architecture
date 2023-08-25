'use strict';

const redis = require('redis');
const { promisify } = require('util');
const InventoryRepository = require('../models/repositories/inventory.repository');
const redisClient = redis.createClient();

redisClient
  .connect()
  .then(() => {
    console.log('Connected to Redis');
  })
  .catch((err) => {
    console.log('Redis client Error::', err);
  });

const pExpire = promisify(redisClient.pExpire).bind(redisClient); // chuyen ham => async await
const setNXAsync = promisify(redisClient.setNX).bind(redisClient); // chuyen ham => async await

class RedisService {
  static acquireLock = async (productId, quantity, cartId) => {
    const key = `lock_v2023_${productId}`;
    const retryTimes = 10;
    const expireTime = 3; // 3 seconds lock

    for (let i = 0; i < retryTimes.length; i++) {
      // tao 1 key, user nao giu thi duoc thanh toan
      const result = await setNXAsync(key, expireTime);
      if (result === 1) {
        // thao tac voi inventory
        const isReservation = await InventoryRepository.reservationInventory({
          productId,
          quantity,
          cartId,
        });
        if (isReservation.modifiedCount) {
          await pExpire(key, expireTime);
          return key;
        }

        return null;
      } else {
        await new Promise((resolve) => setTimeout(resolve, 50)); // moi lan thu cach 50 ms
      }
    }
  };

  static releaseLock = async (keyLock) => {
    const delAsyncKey = promisify(redisClient.del).bind(redisClient);
    return await delAsyncKey(keyLock);
  };
}

module.exports = RedisService;
