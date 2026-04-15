const ChecklistItem = require("../models/checklistItemModel");
const Checklist = require("../models/checklistModel");
const Card = require("../models/cardModel");
const { emitToBoard } = require("../utils/socketEmit");
const { HttpError } = require("../utils/httpError");
const { assertObjectId } = require("./validation");
const { getBoardWithAccess } = require("./accessService");

async function checklistWithAccess(userId, checklistId) {
  const cl = await Checklist.findOne({ _id: checklistId, deletedAt: null });
  if (!cl || cl.deletedAt) throw new HttpError(404, "Not found");
  const card = await Card.findOne({ _id: cl.cardId, deletedAt: null });
  if (!card) throw new HttpError(404, "Not found");
  const board = await getBoardWithAccess(card.boardId, userId);
  if (!board) throw new HttpError(403, "Forbidden");
  return { checklist: cl, card };
}

async function listItems(userId, checklistId) {
  if (!checklistId) throw new HttpError(400, "checklistId query required");
  assertObjectId(checklistId);
  await checklistWithAccess(userId, checklistId);
  return ChecklistItem.find({ checklistId, deletedAt: null }).sort({ position: 1, createdAt: 1 }).lean();
}

async function createItem(app, userId, body) {
  const { checklistId, content, position } = body || {};
  if (!checklistId || !content) throw new HttpError(400, "checklistId and content required");
  const { card } = await checklistWithAccess(userId, checklistId);
  const item = await ChecklistItem.create({
    checklistId,
    content,
    position: position ?? 0,
  });
  emitToBoard(app, String(card.boardId), "checklistItem:created", item.toJSON());
  return item;
}

async function getItem(userId, id) {
  assertObjectId(id);
  const item = await ChecklistItem.findOne({ _id: id, deletedAt: null });
  if (!item) throw new HttpError(404, "Not found");
  await checklistWithAccess(userId, item.checklistId);
  return item;
}

async function updateItem(app, userId, id, body) {
  assertObjectId(id);
  const item = await ChecklistItem.findOne({ _id: id, deletedAt: null });
  if (!item) throw new HttpError(404, "Not found");
  const { card } = await checklistWithAccess(userId, item.checklistId);
  const b = body || {};
  if (b.content !== undefined) item.content = b.content;
  if (b.position !== undefined) item.position = b.position;
  if (b.isCompleted !== undefined) {
    item.isCompleted = b.isCompleted;
    item.completedBy = b.isCompleted ? userId : null;
  }
  await item.save();
  emitToBoard(app, String(card.boardId), "checklistItem:updated", item.toJSON());
  return item;
}

async function deleteItem(app, userId, id) {
  const item = await ChecklistItem.findOne({ _id: id, deletedAt: null });
  if (!item) throw new HttpError(404, "Not found");
  const { card } = await checklistWithAccess(userId, item.checklistId);
  item.deletedAt = new Date();
  await item.save();
  emitToBoard(app, String(card.boardId), "checklistItem:deleted", { id });
}

module.exports = { listItems, createItem, getItem, updateItem, deleteItem };
