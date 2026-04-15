const Card = require("../models/cardModel");
const Board = require("../models/boardModel");
const BoardList = require("../models/boardListModel");
const { logActivity } = require("../utils/activityLog");
const { emitToBoard } = require("../utils/socketEmit");
const { HttpError } = require("../utils/httpError");
const { assertObjectId } = require("./validation");
const { getBoardWithAccess } = require("./accessService");

async function listCards(userId, { listId, boardId }) {
  if (listId) {
    assertObjectId(listId, "Invalid listId");
    const bl = await BoardList.findOne({ _id: listId, deletedAt: null });
    if (!bl) throw new HttpError(404, "List not found");
    const board = await getBoardWithAccess(bl.boardId, userId);
    if (!board) throw new HttpError(403, "Forbidden");
    return Card.find({ listId, archivedAt: null, deletedAt: null })
      .sort({ position: 1, createdAt: 1 })
      .lean();
  }
  if (boardId) {
    assertObjectId(boardId, "Invalid boardId");
    const board = await getBoardWithAccess(boardId, userId);
    if (!board) throw new HttpError(403, "Forbidden");
    return Card.find({ boardId, archivedAt: null, deletedAt: null })
      .sort({ position: 1, createdAt: 1 })
      .lean();
  }
  throw new HttpError(400, "listId or boardId query required");
}

async function createCard(app, userId, body) {
  const { listId, boardId, title, description, position, priority, startAt, dueAt } = body || {};
  if (!listId || !boardId || !title) {
    throw new HttpError(400, "listId, boardId, title required");
  }
  const bl = await BoardList.findOne({ _id: listId, boardId, deletedAt: null });
  if (!bl) throw new HttpError(400, "listId must belong to boardId");
  const board = await getBoardWithAccess(boardId, userId);
  if (!board) throw new HttpError(403, "Forbidden");
  const card = await Card.create({
    listId,
    boardId,
    title,
    description: description || "",
    position: position ?? 0,
    priority: priority || "medium",
    startAt: startAt ? new Date(startAt) : undefined,
    dueAt: dueAt ? new Date(dueAt) : undefined,
    createdBy: userId,
  });
  await logActivity(app, {
    workspaceId: board.workspaceId,
    boardId,
    listId,
    cardId: card._id,
    userId,
    action: "card.created",
    entityType: "card",
    newData: card.toJSON(),
  });
  emitToBoard(app, boardId, "card:created", card.toJSON());
  return card;
}

async function getCard(userId, id) {
  assertObjectId(id);
  const card = await Card.findOne({ _id: id, deletedAt: null });
  if (!card) throw new HttpError(404, "Not found");
  const board = await getBoardWithAccess(card.boardId, userId);
  if (!board) throw new HttpError(403, "Forbidden");
  return card;
}

async function updateCard(app, userId, id, body) {
  const card = await getCard(userId, id);
  const board = await getBoardWithAccess(card.boardId, userId);
  const old = card.toObject();
  const b = body || {};
  if (b.listId !== undefined) {
    assertObjectId(b.listId, "Invalid listId");
    const bl = await BoardList.findOne({ _id: b.listId, boardId: card.boardId, deletedAt: null });
    if (!bl) throw new HttpError(400, "listId must stay on same board");
    card.listId = b.listId;
  }
  if (b.title !== undefined) card.title = b.title;
  if (b.description !== undefined) card.description = b.description;
  if (b.position !== undefined) card.position = b.position;
  if (b.priority !== undefined) card.priority = b.priority;
  if (b.startAt !== undefined) card.startAt = b.startAt ? new Date(b.startAt) : null;
  if (b.dueAt !== undefined) card.dueAt = b.dueAt ? new Date(b.dueAt) : null;
  if (b.completedAt !== undefined) card.completedAt = b.completedAt ? new Date(b.completedAt) : null;
  if (b.isArchived !== undefined) card.isArchived = b.isArchived;
  if (b.archivedAt !== undefined) card.archivedAt = b.archivedAt ? new Date(b.archivedAt) : null;
  await card.save();
  await logActivity(app, {
    workspaceId: board.workspaceId,
    boardId: card.boardId,
    listId: card.listId,
    cardId: card._id,
    userId,
    action: "card.updated",
    entityType: "card",
    oldData: old,
    newData: card.toJSON(),
  });
  emitToBoard(app, String(card.boardId), "card:updated", card.toJSON());
  return card;
}

async function deleteCard(app, userId, id) {
  const card = await getCard(userId, id);
  const bid = card.boardId;
  const boardDoc = await Board.findOne({ _id: bid, deletedAt: null }).lean();
  card.deletedAt = new Date();
  await card.save();
  await logActivity(app, {
    workspaceId: boardDoc.workspaceId,
    boardId: bid,
    listId: card.listId,
    cardId: id,
    userId,
    action: "card.deleted",
    entityType: "card",
    oldData: card.toJSON(),
  });
  emitToBoard(app, String(bid), "card:deleted", { id });
}

module.exports = { listCards, createCard, getCard, updateCard, deleteCard };
