const BoardList = require("../models/boardListModel");
const { logActivity } = require("../utils/activityLog");
const { emitToBoard } = require("../utils/socketEmit");
const { HttpError } = require("../utils/httpError");
const { assertObjectId } = require("./validation");
const { getBoardWithAccess } = require("./accessService");

async function listLists(userId, boardId) {
  if (!boardId) throw new HttpError(400, "boardId query required");
  assertObjectId(boardId, "Invalid boardId");
  const board = await getBoardWithAccess(boardId, userId);
  if (!board) throw new HttpError(403, "Forbidden");
  return BoardList.find({ boardId, deletedAt: null }).sort({ position: 1, createdAt: 1 }).lean();
}

async function createList(app, userId, body) {
  const { boardId, name, position } = body || {};
  if (!boardId || !name) throw new HttpError(400, "boardId and name required");
  const board = await getBoardWithAccess(boardId, userId);
  if (!board) throw new HttpError(403, "Forbidden");
  const list = await BoardList.create({
    boardId,
    name,
    position: position ?? 0,
    createdBy: userId,
  });
  await logActivity(app, {
    workspaceId: board.workspaceId,
    boardId,
    listId: list._id,
    userId,
    action: "list.created",
    entityType: "board_list",
    newData: list.toJSON(),
  });
  emitToBoard(app, boardId, "list:created", list.toJSON());
  return list;
}

async function getList(userId, id) {
  assertObjectId(id);
  const list = await BoardList.findOne({ _id: id, deletedAt: null });
  if (!list) throw new HttpError(404, "Not found");
  const board = await getBoardWithAccess(list.boardId, userId);
  if (!board) throw new HttpError(403, "Forbidden");
  return list;
}

async function updateList(app, userId, id, body) {
  const list = await getList(userId, id);
  const board = await getBoardWithAccess(list.boardId, userId);
  const old = list.toObject();
  const { name, position, isArchived, archivedAt } = body || {};
  if (name !== undefined) list.name = name;
  if (position !== undefined) list.position = position;
  if (isArchived !== undefined) list.isArchived = isArchived;
  if (archivedAt !== undefined) list.archivedAt = archivedAt ? new Date(archivedAt) : null;
  await list.save();
  await logActivity(app, {
    workspaceId: board.workspaceId,
    boardId: list.boardId,
    listId: list._id,
    userId,
    action: "list.updated",
    entityType: "board_list",
    oldData: old,
    newData: list.toJSON(),
  });
  emitToBoard(app, String(list.boardId), "list:updated", list.toJSON());
  return list;
}

async function deleteList(app, userId, id) {
  const list = await getList(userId, id);
  const board = await getBoardWithAccess(list.boardId, userId);
  const bid = list.boardId;
  list.deletedAt = new Date();
  await list.save();
  await logActivity(app, {
    workspaceId: board.workspaceId,
    boardId: bid,
    listId: id,
    userId,
    action: "list.deleted",
    entityType: "board_list",
    oldData: list.toJSON(),
  });
  emitToBoard(app, String(bid), "list:deleted", { id });
}

module.exports = { listLists, createList, getList, updateList, deleteList };
