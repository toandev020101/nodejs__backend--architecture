const compression = require('compression');
const express = require('express');
const { default: helmet } = require('helmet');
const morgan = require('morgan');
const app = express();

// init middlewares
app.use(morgan('dev')); // log http request
app.use(helmet()); // privacy security
app.use(compression()); // reduce bandwidth

// init database
require('./databases/init.mongodb');

//init router
app.get('/', (req, res, next) => {
  return res.status(200).json({
    message: 'Welcome',
  });
});

// handling error

module.exports = app;
