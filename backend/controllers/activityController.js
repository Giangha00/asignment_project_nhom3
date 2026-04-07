const activityService = require("../services/activityService");
const { asyncHandler } = require("../utils/asyncHandler");

const list = asyncHandler(async (req, res) => {
  const rows = await activityService.listActivities(req.userId, {
    boardId: req.query.boardId,
    workspaceId: req.query.workspaceId,
    cardId: req.query.cardId,
  });
  res.json(rows);
});

const create = asyncHandler(async (req, res) => {
  const doc = await activityService.createActivity(req.userId, req.body);
  res.status(201).json(doc);
});

const getOne = asyncHandler(async (req, res) => {
  const doc = await activityService.getActivity(req.userId, req.params.id);
  res.json(doc);
});

const remove = asyncHandler(async (req, res) => {
  await activityService.deleteActivity(req.userId, req.params.id);
  res.status(204).end();
});

module.exports = { list, create, getOne, remove };
