const boardService = require("../services/boardService");
const { asyncHandler } = require("../utils/asyncHandler");

const listByWorkspace = asyncHandler(async (req, res) => {
  const boards = await boardService.listByWorkspace(req.userId, req.query.workspaceId);
  res.json(boards);
});

const create = asyncHandler(async (req, res) => {
  const board = await boardService.createBoard(req.app, req.userId, req.body);
  res.status(201).json(board);
});

const getOne = asyncHandler(async (req, res) => {
  const board = await boardService.getBoard(req.userId, req.params.id);
  res.json(board);
});

const update = asyncHandler(async (req, res) => {
  const board = await boardService.updateBoard(req.app, req.userId, req.params.id, req.body);
  res.json(board);
});

const remove = asyncHandler(async (req, res) => {
  await boardService.deleteBoard(req.app, req.userId, req.params.id);
  res.status(204).end();
});

module.exports = { listByWorkspace, create, getOne, update, remove };
