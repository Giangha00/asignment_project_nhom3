const Attachment = require("../models/attachmentModel");
const Card = require("../models/cardModel");
const { emitToBoard } = require("../utils/socketEmit");
const { HttpError } = require("../utils/httpError");
const { assertObjectId } = require("./validation");
const { getBoardWithAccess } = require("./accessService");

async function cardAccess(userId, cardId) {
  const card = await Card.findOne({ _id: cardId, deletedAt: null });
  if (!card) throw new HttpError(404, "Not found");
  const board = await getBoardWithAccess(card.boardId, userId);
  if (!board) throw new HttpError(403, "Forbidden");
  return card;
}

async function listAttachments(userId, cardId) {
  if (!cardId) throw new HttpError(400, "cardId query required");
  assertObjectId(cardId);
  await cardAccess(userId, cardId);
  return Attachment.find({ cardId, deletedAt: null }).sort({ createdAt: -1 }).lean();
}

async function createAttachment(app, userId, body) {
  const { cardId, fileName, fileUrl, fileMimeType, fileSizeBytes } = body || {};
  if (!cardId || !fileName || !fileUrl) {
    throw new HttpError(400, "cardId, fileName, fileUrl required");
  }
  const card = await cardAccess(userId, cardId);
  const att = await Attachment.create({
    cardId,
    uploadedBy: userId,
    fileName,
    fileUrl,
    fileMimeType: fileMimeType || "",
    fileSizeBytes: fileSizeBytes ?? 0,
  });
  emitToBoard(app, String(card.boardId), "attachment:created", att.toJSON());
  return att;
}

async function getAttachment(userId, id) {
  assertObjectId(id);
  const att = await Attachment.findOne({ _id: id, deletedAt: null });
  if (!att) throw new HttpError(404, "Not found");
  await cardAccess(userId, att.cardId);
  return att;
}

async function deleteAttachment(app, userId, id) {
  const att = await Attachment.findOne({ _id: id, deletedAt: null });
  if (!att) throw new HttpError(404, "Not found");
  const card = await cardAccess(userId, att.cardId);
  att.deletedAt = new Date();
  await att.save();
  emitToBoard(app, String(card.boardId), "attachment:deleted", { id });
}

module.exports = { listAttachments, createAttachment, getAttachment, deleteAttachment };
