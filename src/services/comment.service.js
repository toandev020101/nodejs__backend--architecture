'use strict';

const commentModel = require('../models/comment.model');
const { convertToObjectIdMongodb } = require('../utils');
const { NotFoundError } = require('../core/error.response');
const ProductRepository = require('../models/repositories/product.repository');

/*
  key features: comment service
  + add comment [User | Shop]
  + get a list of comments [User | Shop]
  + delete a comment [User | Shop | Admin]
*/

class CommentService {
  static async createComment({
    productId,
    userId,
    content,
    parentCommentId = null,
  }) {
    const newComment = await commentModel.create({
      comment_productId: convertToObjectIdMongodb(productId),
      comment_userId: userId,
      comment_content: content,
      comment_parentId: convertToObjectIdMongodb(parentCommentId),
    });

    let rightValue;
    if (parentCommentId) {
      // reply comment
      const parentComment = await commentModel.findOne({
        _id: convertToObjectIdMongodb(parentCommentId),
      });
      if (!parentComment) {
        throw new NotFoundError('Parent comment notfound!');
      }

      rightValue = parentComment.comment_right;

      // updateMany comment
      await commentModel.updateMany(
        {
          comment_productId: convertToObjectIdMongodb(productId),
          comment_right: { $gte: rightValue },
        },
        {
          $inc: {
            comment_right: 2,
          },
        },
      );

      await commentModel.updateMany(
        {
          comment_productId: convertToObjectIdMongodb(productId),
          comment_left: { $gt: rightValue },
        },
        {
          $inc: {
            comment_left: 2,
          },
        },
      );
    } else {
      const maxRightValue = await commentModel.findOne(
        {
          comment_productId: convertToObjectIdMongodb(productId),
        },
        'comment_right',
        { sort: { comment_right: -1 } },
      );

      if (maxRightValue) {
        rightValue = maxRightValue.comment_right + 1;
      } else {
        rightValue = 1;
      }
    }

    // insert to comment
    newComment.comment_left = rightValue;
    newComment.comment_right = rightValue + 1;

    await newComment.save();
    return newComment;
  }

  static async getCommentsByParentId({
    productId,
    parentCommentId = null,
    limit = 50,
    skip = 0,
  }) {
    if (parentCommentId) {
      const parentComment = await commentModel.findOne({
        _id: convertToObjectIdMongodb(parentCommentId),
      });
      if (!parentComment) {
        throw new NotFoundError('Not found comment for product');
      }

      const comments = await commentModel
        .find({
          comment_productId: convertToObjectIdMongodb(productId),
          comment_left: { $gt: parentComment.comment_left },
          comment_right: { $lte: parentComment.comment_right },
        })
        .select({
          comment_left: 1,
          comment_right: 1,
          comment_content: 1,
          comment_parentId: 1,
        })
        .sort({
          comment_left: 1,
        });

      return comments;
    }

    const comments = await commentModel
      .find({
        comment_productId: convertToObjectIdMongodb(productId),
        comment_parentId: null,
      })
      .select({
        comment_left: 1,
        comment_right: 1,
        comment_content: 1,
        comment_parentId: 1,
      })
      .sort({
        comment_left: 1,
      });

    return comments;
  }

  static async deleteComment({ commentId, productId }) {
    // check the product exists in the db
    const foundProduct = await ProductRepository.findProduct({
      product_id: productId,
    });

    if (!foundProduct) {
      throw new NotFoundError('Product not found');
    }

    // xac dinh left right
    const comment = await commentModel.findById(commentId);
    if (!comment) {
      throw new NotFoundError('Comment not found');
    }

    const leftValue = comment.comment_left;
    const rightValue = comment.comment_right;
    // tinh width
    const width = rightValue - leftValue + 1;

    // xoa commentId con
    await commentModel.deleteMany({
      comment_productId: convertToObjectIdMongodb(productId),
      comment_left: { $gte: leftValue, $lte: rightValue },
    });

    // cap nhat gia tri left right con lai
    await commentModel.updateMany(
      {
        comment_productId: convertToObjectIdMongodb(productId),
        comment_right: { $gt: rightValue },
      },
      {
        $inc: {
          comment_right: -width,
        },
      },
    );

    await commentModel.updateMany(
      {
        comment_productId: convertToObjectIdMongodb(productId),
        comment_left: { $gt: rightValue },
      },
      {
        $inc: {
          comment_left: -width,
        },
      },
    );

    return true;
  }
}

module.exports = CommentService;
