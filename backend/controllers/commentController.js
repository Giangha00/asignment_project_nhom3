const commentService = require("../services/commentService");
const { asyncHandler } = require("../utils/asyncHandler");

const list = asyncHandler(async (req, res) => {
  const rows = await commentService.listComments(req.userId, req.query.cardId);
  res.json(rows);
});

const create = asyncHandler(async (req, res) => {
  const comment = await commentService.createComment(req.app, req.userId, req.body);
  res.status(201).json(comment);
});

const getOne = asyncHandler(async (req, res) => {
  const comment = await commentService.getComment(req.userId, req.params.id);
  res.json(comment);
});

const update = asyncHandler(async (req, res) => {
  const comment = await commentService.updateComment(req.app, req.userId, req.params.id, req.body);
  res.json(comment);
});

const remove = asyncHandler(async (req, res) => {
  await commentService.deleteComment(req.app, req.userId, req.params.id);
  res.status(204).end();
});

module.exports = { list, create, getOne, update, remove };
