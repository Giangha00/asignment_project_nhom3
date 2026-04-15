const mongoose = require("mongoose");
const WorkspaceMember = require("../models/workSpaceMemberModel");
const Board = require("../models/boardModel");
const BoardMember = require("../models/boardMemberModel");
const BoardList = require("../models/boardListModel");
const Card = require("../models/cardModel");

async function isWorkspaceMember(workspaceId, userId) {
  if (!mongoose.Types.ObjectId.isValid(workspaceId)) return false;
  const baseQuery = {
    workspaceId,
    userId,
    status: "active",
    deletedAt: null,
  };
  const now = new Date();
  const cutoff = new Date(now.getTime() - 60_000);

  const touched = await WorkspaceMember.findOneAndUpdate(
    {
      ...baseQuery,
      $or: [{ lastActive: { $exists: false } }, { lastActive: null }, { lastActive: { $lt: cutoff } }],
    },
    { $set: { lastActive: now } },
    { new: false, projection: { _id: 1 } }
  ).lean();
  if (touched) return true;

  const m = await WorkspaceMember.findOne(baseQuery).select("_id").lean();
  return Boolean(m);
}

async function isBoardMember(boardId, userId) {
  if (!mongoose.Types.ObjectId.isValid(boardId)) return false;
  const m = await BoardMember.findOne({ boardId, userId }).lean();
  return Boolean(m);
}

async function getBoardWithAccess(boardId, userId) {
  if (!mongoose.Types.ObjectId.isValid(boardId)) return null;
  const board = await Board.findById(boardId).lean();
  if (!board) return null;
  const wsOk = await isWorkspaceMember(board.workspaceId, userId);
  const bmOk = await isBoardMember(boardId, userId);
  if (!wsOk && !bmOk) return null;
  return board;
}

async function getListBoardId(listId) {
  if (!mongoose.Types.ObjectId.isValid(listId)) return null;
  const list = await BoardList.findById(listId).lean();
  return list ? list.boardId : null;
}

async function getCardBoardId(cardId) {
  if (!mongoose.Types.ObjectId.isValid(cardId)) return null;
  const card = await Card.findById(cardId).lean();
  return card ? card.boardId : null;
}

module.exports = {
  isWorkspaceMember,
  isBoardMember,
  getBoardWithAccess,
  getListBoardId,
  getCardBoardId,
};
