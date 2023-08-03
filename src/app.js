require('dotenv').config();
const compression = require('compression');
const express = require('express');
const { default: helmet } = require('helmet');
const morgan = require('morgan');
const app = express();

// init middlewares
app.use(morgan('dev')); // log http request
app.use(helmet()); // privacy security
app.use(compression()); // reduce bandwidth
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// init database
require('./databases/init.mongodb');

//init router
app.use('', require('./routes'));

// handling error

module.exports = app;
