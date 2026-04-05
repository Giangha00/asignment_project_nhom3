const workspaceMemberService = require("../services/workspaceMemberService");
const { asyncHandler } = require("../utils/asyncHandler");

const list = asyncHandler(async (req, res) => {
  const rows = await workspaceMemberService.listMembers(req.userId, req.params.workspaceId);
  res.json(rows);
});

const add = asyncHandler(async (req, res) => {
  const row = await workspaceMemberService.addMember(req.app, req.userId, req.params.workspaceId, req.body);
  res.status(201).json(row);
});

const update = asyncHandler(async (req, res) => {
  const row = await workspaceMemberService.updateMember(
    req.app,
    req.userId,
    req.params.workspaceId,
    req.params.id,
    req.body
  );
  res.json(row);
});

const remove = asyncHandler(async (req, res) => {
  await workspaceMemberService.removeMember(req.app, req.userId, req.params.workspaceId, req.params.id);
  res.status(204).end();
});

module.exports = { list, add, update, remove };
