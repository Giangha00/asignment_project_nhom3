const BoardMember = require("../models/boardMemberModel");
const Board = require("../models/boardModel");
const User = require("../models/userModel");
const { emitToBoard, emitToUser } = require("../utils/socketEmit");
const { HttpError } = require("../utils/httpError");
const { assertObjectId } = require("./validation");
const { isWorkspaceMember, isBoardMember } = require("./accessService");

async function assertBoardAccess(userId, boardId) {
  assertObjectId(boardId);
  const board = await Board.findOne({ _id: boardId, deletedAt: null });
  if (!board) throw new HttpError(404, "Not found");
  const ok =
    (await isWorkspaceMember(board.workspaceId, userId)) || (await isBoardMember(boardId, userId));
  if (!ok) throw new HttpError(403, "Forbidden");
  return board;
}

async function assertWorkspaceMemberForBoard(userId, boardId) {
  assertObjectId(boardId);
  const board = await Board.findOne({ _id: boardId, deletedAt: null });
  if (!board) throw new HttpError(404, "Not found");
  const ok = await isWorkspaceMember(board.workspaceId, userId);
  if (!ok) throw new HttpError(403, "Forbidden");
  return board;
}

async function listBoardMembers(userId, boardId) {
  await assertBoardAccess(userId, boardId);
  return BoardMember.find({ boardId, deletedAt: null }).populate("userId").lean();
}

async function addBoardMember(app, actorUserId, boardId, body) {
  const { userId: targetUserId, role } = body || {};
  assertObjectId(boardId, "Invalid id");
  assertObjectId(targetUserId, "boardId and userId required");
  await assertWorkspaceMemberForBoard(actorUserId, boardId);
  const target = await User.findById(targetUserId);
  if (!target || target.deletedAt) throw new HttpError(404, "User not found");
  const row = await BoardMember.findOneAndUpdate(
    { boardId, userId: targetUserId, deletedAt: null },
    { $set: { role: role || "member", deletedAt: null } },
    { upsert: true, new: true }
  );
  const payload = row.toJSON();
  emitToBoard(app, boardId, "boardMember:upserted", payload);
  emitToUser(app, targetUserId, "boardMember:upserted", payload);
  return row;
}

async function updateBoardMember(app, actorUserId, boardId, memberId, body) {
  assertObjectId(boardId, "Invalid id");
  assertObjectId(memberId, "Invalid id");
  await assertWorkspaceMemberForBoard(actorUserId, boardId);
  const row = await BoardMember.findOne({ _id: memberId, boardId, deletedAt: null });
  if (!row) throw new HttpError(404, "Not found");
  if (body.role !== undefined) row.role = body.role;
  await row.save();
  emitToBoard(app, boardId, "boardMember:updated", row.toJSON());
  return row;
}

async function removeBoardMember(app, actorUserId, boardId, memberId) {
  assertObjectId(boardId, "Invalid id");
  assertObjectId(memberId, "Invalid id");
  await assertWorkspaceMemberForBoard(actorUserId, boardId);
  const row = await BoardMember.findOne({ _id: memberId, boardId, deletedAt: null });
  if (!row) throw new HttpError(404, "Not found");
  row.deletedAt = new Date();
  await row.save();
  emitToBoard(app, boardId, "boardMember:removed", { id: row._id });
}

module.exports = {
  listBoardMembers,
  addBoardMember,
  updateBoardMember,
  removeBoardMember,
};
