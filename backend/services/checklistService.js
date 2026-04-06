const Checklist = require("../models/checklistModel");
const Card = require("../models/cardModel");
const { emitToBoard } = require("../utils/socketEmit");
const { HttpError } = require("../utils/httpError");
const { assertObjectId } = require("./validation");
const { getBoardWithAccess } = require("./accessService");

async function cardWithAccess(userId, cardId) {
  const card = await Card.findById(cardId);
  if (!card) throw new HttpError(404, "Not found");
  const board = await getBoardWithAccess(card.boardId, userId);
  if (!board) throw new HttpError(403, "Forbidden");
  return card;
}

async function listChecklists(userId, cardId) {
  if (!cardId) throw new HttpError(400, "cardId query required");
  assertObjectId(cardId);
  await cardWithAccess(userId, cardId);
  return Checklist.find({ cardId, deletedAt: null }).sort({ position: 1, createdAt: 1 }).lean();
}

async function createChecklist(app, userId, body) {
  const { cardId, title, position } = body || {};
  if (!cardId || !title) throw new HttpError(400, "cardId and title required");
  const card = await cardWithAccess(userId, cardId);
  const cl = await Checklist.create({
    cardId,
    title,
    position: position ?? 0,
    createdBy: userId,
  });
  emitToBoard(app, String(card.boardId), "checklist:created", cl.toJSON());
  return cl;
}

async function getChecklist(userId, id) {
  assertObjectId(id);
  const cl = await Checklist.findById(id);
  if (!cl || cl.deletedAt) throw new HttpError(404, "Not found");
  await cardWithAccess(userId, cl.cardId);
  return cl;
}

async function updateChecklist(app, userId, id, body) {
  const cl = await getChecklist(userId, id);
  const card = await Card.findById(cl.cardId);
  const { title, position } = body || {};
  if (title !== undefined) cl.title = title;
  if (position !== undefined) cl.position = position;
  await cl.save();
  emitToBoard(app, String(card.boardId), "checklist:updated", cl.toJSON());
  return cl;
}

async function deleteChecklist(app, userId, id) {
  const cl = await getChecklist(userId, id);
  const card = await Card.findById(cl.cardId);
  cl.deletedAt = new Date();
  await cl.save();
  emitToBoard(app, String(card.boardId), "checklist:deleted", { id: cl._id });
}

module.exports = { listChecklists, createChecklist, getChecklist, updateChecklist, deleteChecklist };
