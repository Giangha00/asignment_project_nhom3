const Comment = require("../models/commentsModel");
const Card = require("../models/cardModel");
const { emitToBoard } = require("../utils/socketEmit");
const { HttpError } = require("../utils/httpError");
const { assertObjectId } = require("./validation");
const { getBoardWithAccess } = require("./accessService");

async function getCardForComment(userId, cardId) {
  const card = await Card.findById(cardId);
  if (!card) throw new HttpError(404, "Not found");
  const board = await getBoardWithAccess(card.boardId, userId);
  if (!board) throw new HttpError(403, "Forbidden");
  return card;
}

async function listComments(userId, cardId) {
  if (!cardId) throw new HttpError(400, "cardId query required");
  assertObjectId(cardId);
  await getCardForComment(userId, cardId);
  return Comment.find({ cardId, deletedAt: null }).sort({ createdAt: 1 }).lean();
}

async function createComment(app, userId, body) {
  const { cardId, content } = body || {};
  if (!cardId || !content) throw new HttpError(400, "cardId and content required");
  const card = await getCardForComment(userId, cardId);
  const comment = await Comment.create({ cardId, userId, content });
  emitToBoard(app, String(card.boardId), "comment:created", comment.toJSON());
  return comment;
}

async function getComment(userId, id) {
  assertObjectId(id);
  const comment = await Comment.findById(id);
  if (!comment || comment.deletedAt) throw new HttpError(404, "Not found");
  await getCardForComment(userId, comment.cardId);
  return comment;
}

async function updateComment(app, userId, id, body) {
  const comment = await getComment(userId, id);
  if (String(comment.userId) !== String(userId)) throw new HttpError(403, "Forbidden");
  const card = await Card.findById(comment.cardId);
  if (body.content !== undefined) comment.content = body.content;
  await comment.save();
  emitToBoard(app, String(card.boardId), "comment:updated", comment.toJSON());
  return comment;
}

async function deleteComment(app, userId, id) {
  const comment = await Comment.findById(id);
  if (!comment || comment.deletedAt) throw new HttpError(404, "Not found");
  const card = await Card.findById(comment.cardId);
  const board = await getBoardWithAccess(card.boardId, userId);
  if (!board) throw new HttpError(403, "Forbidden");
  comment.deletedAt = new Date();
  await comment.save();
  emitToBoard(app, String(card.boardId), "comment:deleted", { id: comment._id });
}

module.exports = { listComments, createComment, getComment, updateComment, deleteComment };
