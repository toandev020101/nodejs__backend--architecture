'use strict';

const { ReasonPhrases, StatusCodes } = require('./httpStatusCode');

class ErrorResponse extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

class ConflictRequestError extends ErrorResponse {
  constructor(
    message = ReasonPhrases.CONFLICT,
    statusCode = StatusCodes.CONFLICT,
  ) {
    super(message, statusCode);
  }
}

class BadRequestError extends ErrorResponse {
  constructor(
    message = ReasonPhrases.BAD_REQUEST,
    statusCode = StatusCodes.BAD_REQUEST,
  ) {
    super(message, statusCode);
  }
}

module.exports = {
  ConflictRequestError,
  BadRequestError,
};
