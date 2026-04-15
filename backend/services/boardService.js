const Board = require("../models/boardModel");
const BoardMember = require("../models/boardMemberModel");
const { logActivity } = require("../utils/activityLog");
const { emitToBoard, emitToWorkspace } = require("../utils/socketEmit");
const { HttpError } = require("../utils/httpError");
const { assertObjectId } = require("./validation");
const { isWorkspaceMember } = require("./accessService");

async function listByWorkspace(userId, workspaceId) {
  assertObjectId(workspaceId, "workspaceId query required");
  const ok = await isWorkspaceMember(workspaceId, userId);
  if (!ok) throw new HttpError(403, "Forbidden");
  return Board.find({ workspaceId, archivedAt: null, deletedAt: null }).sort({ createdAt: -1 }).lean();
}

async function createBoard(app, userId, body) {
  const { workspaceId, name, description, visibility, coverUrl } = body || {};
  if (!workspaceId || !name) throw new HttpError(400, "workspaceId and name required");
  assertObjectId(workspaceId, "Invalid workspaceId");
  const ok = await isWorkspaceMember(workspaceId, userId);
  if (!ok) throw new HttpError(403, "Forbidden");
  const board = await Board.create({
    workspaceId,
    name,
    description: description || "",
    visibility: visibility || "workspace",
    createdBy: userId,
    coverUrl: coverUrl || "",
  });
  await BoardMember.create({ boardId: board._id, userId, role: "admin" });
  await logActivity(app, {
    workspaceId: board.workspaceId,
    boardId: board._id,
    userId,
    action: "board.created",
    entityType: "board",
    newData: board.toJSON(),
  });
  emitToBoard(app, String(board._id), "board:created", board.toJSON());
  emitToWorkspace(app, String(workspaceId), "board:created", board.toJSON());
  return board;
}

async function getBoard(userId, id) {
  assertObjectId(id);
  const board = await Board.findOne({ _id: id, deletedAt: null });
  if (!board) throw new HttpError(404, "Not found");
  const wsOk = await isWorkspaceMember(board.workspaceId, userId);
  const bm = await BoardMember.findOne({ boardId: id, userId, deletedAt: null });
  if (!wsOk && !bm) throw new HttpError(403, "Forbidden");
  return board;
}

async function updateBoard(app, userId, id, body) {
  const board = await getBoardForWorkspaceAdmin(userId, id);
  const old = board.toObject();
  const { name, description, visibility, coverUrl, isStarred, archivedAt } = body || {};
  if (name !== undefined) board.name = name;
  if (description !== undefined) board.description = description;
  if (visibility !== undefined) board.visibility = visibility;
  if (coverUrl !== undefined) board.coverUrl = coverUrl;
  if (isStarred !== undefined) board.isStarred = isStarred;
  if (archivedAt !== undefined) board.archivedAt = archivedAt ? new Date(archivedAt) : null;
  await board.save();
  await logActivity(app, {
    workspaceId: board.workspaceId,
    boardId: board._id,
    userId,
    action: "board.updated",
    entityType: "board",
    oldData: old,
    newData: board.toJSON(),
  });
  emitToBoard(app, String(board._id), "board:updated", board.toJSON());
  return board;
}

async function getBoardForWorkspaceAdmin(userId, id) {
  assertObjectId(id);
  const board = await Board.findOne({ _id: id, deletedAt: null });
  if (!board) throw new HttpError(404, "Not found");
  const ok = await isWorkspaceMember(board.workspaceId, userId);
  if (!ok) throw new HttpError(403, "Forbidden");
  return board;
}

async function deleteBoard(app, userId, id) {
  const board = await getBoardForWorkspaceAdmin(userId, id);
  const wid = board.workspaceId;
  const snapshot = board.toJSON();
  board.deletedAt = new Date();
  await board.save();
  await logActivity(app, {
    workspaceId: wid,
    boardId: id,
    userId,
    action: "board.deleted",
    entityType: "board",
    oldData: snapshot,
  });
  emitToBoard(app, String(id), "board:deleted", { id });
  emitToWorkspace(app, String(wid), "board:deleted", { id });
}

module.exports = {
  listByWorkspace,
  createBoard,
  getBoard,
  updateBoard,
  deleteBoard,
};
