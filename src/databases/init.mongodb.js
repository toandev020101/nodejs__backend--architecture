'use strict';

const mongoose = require('mongoose');
const { countConnect } = require('../helpers/check.connect');
const {
  db: { host, port, name },
} = require('../configs/config.mongodb');

const connectString = `mongodb://${host}:${port}/${name}`;

console.log(connectString);

class Database {
  // setup
  constructor() {
    this.connect();
  }

  // connect function
  connect(type = 'mongodb') {
    switch (type) {
      case 'mongodb':
        // dev
        if (1 === 1) {
          mongoose.set('debug', true);
          mongoose.set('debug', { color: true });
        }

        mongoose
          .connect(connectString, { maxPoolSize: 50 })
          .then((_) => {
            countConnect();
            console.log(`Connected Mongodb Success`);
          })
          .catch((err) => console.log(`Error Connect ! ${err}`));
        break;
      default:
        break;
    }
  }

  // connect one
  static getInstance() {
    if (!Database.instance) {
      Database.instance = new Database();
    }

    return Database.instance;
  }
}

const instanceMongodb = Database.getInstance();

module.exports = instanceMongodb;
