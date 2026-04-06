const CardMember = require("../models/cardMemberModel");
const Card = require("../models/cardModel");
const User = require("../models/userModel");
const { emitToBoard } = require("../utils/socketEmit");
const { HttpError } = require("../utils/httpError");
const { assertObjectId } = require("./validation");
const { getBoardWithAccess } = require("./accessService");

async function getCardAndBoard(userId, cardId) {
  assertObjectId(cardId);
  const card = await Card.findById(cardId);
  if (!card) throw new HttpError(404, "Not found");
  const board = await getBoardWithAccess(card.boardId, userId);
  if (!board) throw new HttpError(403, "Forbidden");
  return { card, board };
}

async function listAssignees(userId, cardId) {
  await getCardAndBoard(userId, cardId);
  return CardMember.find({ cardId }).populate("userId").lean();
}

async function addAssignee(app, actorUserId, cardId, body) {
  const { userId: targetUserId } = body || {};
  assertObjectId(cardId, "Invalid id");
  assertObjectId(targetUserId, "cardId and userId required");
  const { card } = await getCardAndBoard(actorUserId, cardId);
  const target = await User.findById(targetUserId);
  if (!target || target.deletedAt) throw new HttpError(404, "User not found");
  const row = await CardMember.findOneAndUpdate(
    { cardId, userId: targetUserId },
    { $set: { assignedBy: actorUserId, assignedAt: new Date() } },
    { upsert: true, new: true }
  );
  emitToBoard(app, String(card.boardId), "cardMember:upserted", row.toJSON());
  return row;
}

async function removeAssignee(app, actorUserId, cardId, memberId) {
  assertObjectId(cardId, "Invalid id");
  assertObjectId(memberId, "Invalid id");
  const { card } = await getCardAndBoard(actorUserId, cardId);
  const row = await CardMember.findOneAndDelete({ _id: memberId, cardId });
  if (!row) throw new HttpError(404, "Not found");
  emitToBoard(app, String(card.boardId), "cardMember:removed", { id: row._id });
}

module.exports = { listAssignees, addAssignee, removeAssignee };
