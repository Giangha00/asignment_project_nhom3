const checklistItemService = require("../services/checklistItemService");
const { asyncHandler } = require("../utils/asyncHandler");

const list = asyncHandler(async (req, res) => {
  const rows = await checklistItemService.listItems(req.userId, req.query.checklistId);
  res.json(rows);
});

const create = asyncHandler(async (req, res) => {
  const item = await checklistItemService.createItem(req.app, req.userId, req.body);
  res.status(201).json(item);
});

const getOne = asyncHandler(async (req, res) => {
  const item = await checklistItemService.getItem(req.userId, req.params.id);
  res.json(item);
});

const update = asyncHandler(async (req, res) => {
  const item = await checklistItemService.updateItem(req.app, req.userId, req.params.id, req.body);
  res.json(item);
});

const remove = asyncHandler(async (req, res) => {
  await checklistItemService.deleteItem(req.app, req.userId, req.params.id);
  res.status(204).end();
});

module.exports = { list, create, getOne, update, remove };
