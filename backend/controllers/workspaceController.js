const workspaceService = require("../services/workspaceService");
const { asyncHandler } = require("../utils/asyncHandler");

const listMine = asyncHandler(async (req, res) => {
  const workspaces = await workspaceService.listMine(req.userId);
  res.json(workspaces);
});

const create = asyncHandler(async (req, res) => {
  const ws = await workspaceService.createWorkspace(req.app, req.userId, req.body);
  res.status(201).json(ws);
});

const getOne = asyncHandler(async (req, res) => {
  const ws = await workspaceService.getWorkspace(req.userId, req.params.id);
  res.json(ws);
});

const update = asyncHandler(async (req, res) => {
  const ws = await workspaceService.updateWorkspace(req.app, req.userId, req.params.id, req.body);
  res.json(ws);
});

const remove = asyncHandler(async (req, res) => {
  await workspaceService.deleteWorkspace(req.app, req.userId, req.params.id);
  res.status(204).end();
});

module.exports = { listMine, create, getOne, update, remove };
