const CardLabel = require("../models/cardLableModel");
const Card = require("../models/cardModel");
const Label = require("../models/labelsModel");
const { emitToBoard } = require("../utils/socketEmit");
const { HttpError } = require("../utils/httpError");
const { assertObjectId } = require("./validation");
const { getBoardWithAccess } = require("./accessService");

async function listCardLabels(userId, cardId) {
  if (!cardId) throw new HttpError(400, "cardId query required");
  assertObjectId(cardId, "Invalid cardId");
  const card = await Card.findOne({ _id: cardId, deletedAt: null });
  if (!card) throw new HttpError(404, "Not found");
  const board = await getBoardWithAccess(card.boardId, userId);
  if (!board) throw new HttpError(403, "Forbidden");
  return CardLabel.find({ cardId }).populate("labelId").lean();
}

async function assignLabel(app, userId, body) {
  const { cardId, labelId } = body || {};
  if (!cardId || !labelId) throw new HttpError(400, "cardId and labelId required");
  assertObjectId(cardId);
  assertObjectId(labelId);
  const card = await Card.findOne({ _id: cardId, deletedAt: null });
  if (!card) throw new HttpError(404, "Card not found");
  const board = await getBoardWithAccess(card.boardId, userId);
  if (!board) throw new HttpError(403, "Forbidden");
  const label = await Label.findOne({ _id: labelId, boardId: card.boardId });
  if (!label) throw new HttpError(400, "label must belong to same board");
  let row = await CardLabel.findOne({ cardId, labelId });
  if (!row) row = await CardLabel.create({ cardId, labelId });
  emitToBoard(app, String(card.boardId), "cardLabel:upserted", row.toJSON());
  return row;
}

async function removeCardLabel(app, userId, id) {
  assertObjectId(id);
  const row = await CardLabel.findById(id);
  if (!row) throw new HttpError(404, "Not found");
  const card = await Card.findOne({ _id: row.cardId, deletedAt: null });
  if (!card) throw new HttpError(404, "Not found");
  const board = await getBoardWithAccess(card.boardId, userId);
  if (!board) throw new HttpError(403, "Forbidden");
  await CardLabel.deleteOne({ _id: id });
  emitToBoard(app, String(card.boardId), "cardLabel:removed", { id });
}

module.exports = { listCardLabels, assignLabel, removeCardLabel };
