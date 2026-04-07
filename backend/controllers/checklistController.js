const checklistService = require("../services/checklistService");
const { asyncHandler } = require("../utils/asyncHandler");

const list = asyncHandler(async (req, res) => {
  const rows = await checklistService.listChecklists(req.userId, req.query.cardId);
  res.json(rows);
});

const create = asyncHandler(async (req, res) => {
  const cl = await checklistService.createChecklist(req.app, req.userId, req.body);
  res.status(201).json(cl);
});

const getOne = asyncHandler(async (req, res) => {
  const cl = await checklistService.getChecklist(req.userId, req.params.id);
  res.json(cl);
});

const update = asyncHandler(async (req, res) => {
  const cl = await checklistService.updateChecklist(req.app, req.userId, req.params.id, req.body);
  res.json(cl);
});

const remove = asyncHandler(async (req, res) => {
  await checklistService.deleteChecklist(req.app, req.userId, req.params.id);
  res.status(204).end();
});

module.exports = { list, create, getOne, update, remove };
