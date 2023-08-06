'use strict';

const { Schema, model } = require('mongoose'); // Erase if already required

const DOCUMENT_NAME = 'KeyToken';
const COLLECTION_NAME = 'KeyTokens';

// Declare the Schema of the Mongo model
const keyTokenSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Shop',
    },
    privateKey: {
      type: String,
      required: true,
    },
    publicKey: {
      type: String,
      required: true,
    },
    refreshTokensUsed: {
      type: Array,
      default: [],
    },
    refreshToken: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  },
);

//Export the model
module.exports = model(DOCUMENT_NAME, keyTokenSchema);
