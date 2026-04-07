const Label = require("../models/labelsModel");
const { emitToBoard } = require("../utils/socketEmit");
const { HttpError } = require("../utils/httpError");
const { assertObjectId } = require("./validation");
const { getBoardWithAccess } = require("./accessService");

async function listLabels(userId, boardId) {
  if (!boardId) throw new HttpError(400, "boardId query required");
  assertObjectId(boardId, "Invalid boardId");
  const board = await getBoardWithAccess(boardId, userId);
  if (!board) throw new HttpError(403, "Forbidden");
  return Label.find({ boardId }).sort({ createdAt: 1 }).lean();
}

async function createLabel(app, userId, body) {
  const { boardId, name, color } = body || {};
  if (!boardId || !name) throw new HttpError(400, "boardId and name required");
  const board = await getBoardWithAccess(boardId, userId);
  if (!board) throw new HttpError(403, "Forbidden");
  const label = await Label.create({ boardId, name, color: color || "#94a3b8" });
  emitToBoard(app, boardId, "label:created", label.toJSON());
  return label;
}

async function getLabel(userId, id) {
  assertObjectId(id);
  const label = await Label.findById(id);
  if (!label) throw new HttpError(404, "Not found");
  const board = await getBoardWithAccess(label.boardId, userId);
  if (!board) throw new HttpError(403, "Forbidden");
  return label;
}

async function updateLabel(app, userId, id, body) {
  const label = await getLabel(userId, id);
  const { name, color } = body || {};
  if (name !== undefined) label.name = name;
  if (color !== undefined) label.color = color;
  await label.save();
  emitToBoard(app, String(label.boardId), "label:updated", label.toJSON());
  return label;
}

async function deleteLabel(app, userId, id) {
  const label = await getLabel(userId, id);
  const bid = label.boardId;
  await Label.deleteOne({ _id: id });
  emitToBoard(app, String(bid), "label:deleted", { id });
}

module.exports = { listLabels, createLabel, getLabel, updateLabel, deleteLabel };
