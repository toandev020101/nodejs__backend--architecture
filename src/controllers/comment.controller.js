'use strict';

const { SuccessResponse } = require('../core/success.response');
const CommentService = require('../services/comment.service');

class CommentController {
  createComment = async (req, res, next) => {
    new SuccessResponse({
      message: 'create Comment success!',
      metadata: await CommentService.createComment(req.body),
    }).send(res);
  };

  getCommentsByParentId = async (req, res, next) => {
    new SuccessResponse({
      message: 'get Comments success!',
      metadata: await CommentService.getCommentsByParentId(req.query),
    }).send(res);
  };

  deleteComment = async (req, res, next) => {
    new SuccessResponse({
      message: 'delete Comments success!',
      metadata: await CommentService.deleteComment(req.body),
    }).send(res);
  };
}

module.exports = new CommentController();
