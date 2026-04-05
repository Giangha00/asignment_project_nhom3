const boardListService = require("../services/boardListService");
const { asyncHandler } = require("../utils/asyncHandler");

const list = asyncHandler(async (req, res) => {
  const rows = await boardListService.listLists(req.userId, req.query.boardId);
  res.json(rows);
});

const create = asyncHandler(async (req, res) => {
  const row = await boardListService.createList(req.app, req.userId, req.body);
  res.status(201).json(row);
});

const getOne = asyncHandler(async (req, res) => {
  const row = await boardListService.getList(req.userId, req.params.id);
  res.json(row);
});

const update = asyncHandler(async (req, res) => {
  const row = await boardListService.updateList(req.app, req.userId, req.params.id, req.body);
  res.json(row);
});

const remove = asyncHandler(async (req, res) => {
  await boardListService.deleteList(req.app, req.userId, req.params.id);
  res.status(204).end();
});

module.exports = { list, create, getOne, update, remove };
