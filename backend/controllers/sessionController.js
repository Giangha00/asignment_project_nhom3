const userSessionService = require("../services/userSessionService");
const { asyncHandler } = require("../utils/asyncHandler");

const listMine = asyncHandler(async (req, res) => {
  const rows = await userSessionService.listSessions(req.userId);
  res.json(rows);
});

const getOne = asyncHandler(async (req, res) => {
  const row = await userSessionService.getSession(req.userId, req.params.id);
  res.json(row);
});

const revoke = asyncHandler(async (req, res) => {
  const row = await userSessionService.revokeSession(req.userId, req.params.id);
  res.json(row);
});

const remove = asyncHandler(async (req, res) => {
  await userSessionService.deleteSession(req.userId, req.params.id);
  res.status(204).end();
});

module.exports = { listMine, getOne, revoke, remove };
