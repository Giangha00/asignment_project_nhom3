const cardMemberService = require("../services/cardMemberService");
const { asyncHandler } = require("../utils/asyncHandler");

const list = asyncHandler(async (req, res) => {
  const rows = await cardMemberService.listAssignees(req.userId, req.params.cardId);
  res.json(rows);
});

const add = asyncHandler(async (req, res) => {
  const row = await cardMemberService.addAssignee(req.app, req.userId, req.params.cardId, req.body);
  res.status(201).json(row);
});

const remove = asyncHandler(async (req, res) => {
  await cardMemberService.removeAssignee(req.app, req.userId, req.params.cardId, req.params.id);
  res.status(204).end();
});

module.exports = { list, add, remove };
