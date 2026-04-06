const cardLabelService = require("../services/cardLabelService");
const { asyncHandler } = require("../utils/asyncHandler");

const list = asyncHandler(async (req, res) => {
  const rows = await cardLabelService.listCardLabels(req.userId, req.query.cardId);
  res.json(rows);
});

const create = asyncHandler(async (req, res) => {
  const row = await cardLabelService.assignLabel(req.app, req.userId, req.body);
  res.status(201).json(row);
});

const remove = asyncHandler(async (req, res) => {
  await cardLabelService.removeCardLabel(req.app, req.userId, req.params.id);
  res.status(204).end();
});

module.exports = { list, create, remove };
