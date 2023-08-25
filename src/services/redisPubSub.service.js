'use strict';

const Redis = require('redis');

class RedisPubSubService {
  constructor() {
    this.subscriber = Redis.createClient();
    this.publisher = Redis.createClient();

    this.subscriber
      .connect()
      .then(() => {
        console.log('Connected to Redis subscriber');
      })
      .catch((err) => {
        console.log('Redis subscriber client Error::', err);
      });

    this.publisher
      .connect()
      .then(() => {
        console.log('Connected to Redis publisher');
      })
      .catch((err) => {
        console.log('Redis publisher client Error::', err);
      });
  }

  publish(channel, message) {
    return new Promise((resovel, reject) => {
      this.publisher.publish(channel, message, (err, reply) => {
        if (err) {
          reject(err);
        } else {
          resovel(reply);
        }
      });
    });
  }

  subscribe(channel, callback) {
    this.subscriber.subscribe(channel);
    this.subscriber.on('message', (subscriberChannel, message) => {
      if (channel === subscriberChannel) {
        callback(channel, message);
      }
    });
  }
}

module.exports = new RedisPubSubService();
