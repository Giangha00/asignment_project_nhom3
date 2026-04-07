const labelService = require("../services/labelService");
const { asyncHandler } = require("../utils/asyncHandler");

const list = asyncHandler(async (req, res) => {
  const rows = await labelService.listLabels(req.userId, req.query.boardId);
  res.json(rows);
});

const create = asyncHandler(async (req, res) => {
  const label = await labelService.createLabel(req.app, req.userId, req.body);
  res.status(201).json(label);
});

const getOne = asyncHandler(async (req, res) => {
  const label = await labelService.getLabel(req.userId, req.params.id);
  res.json(label);
});

const update = asyncHandler(async (req, res) => {
  const label = await labelService.updateLabel(req.app, req.userId, req.params.id, req.body);
  res.json(label);
});

const remove = asyncHandler(async (req, res) => {
  await labelService.deleteLabel(req.app, req.userId, req.params.id);
  res.status(204).end();
});

module.exports = { list, create, getOne, update, remove };
