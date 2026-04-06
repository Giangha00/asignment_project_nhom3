const boardMemberService = require("../services/boardMemberService");
const { asyncHandler } = require("../utils/asyncHandler");

const list = asyncHandler(async (req, res) => {
  const rows = await boardMemberService.listBoardMembers(req.userId, req.params.boardId);
  res.json(rows);
});

const add = asyncHandler(async (req, res) => {
  const row = await boardMemberService.addBoardMember(req.app, req.userId, req.params.boardId, req.body);
  res.status(201).json(row);
});

const update = asyncHandler(async (req, res) => {
  const row = await boardMemberService.updateBoardMember(
    req.app,
    req.userId,
    req.params.boardId,
    req.params.id,
    req.body
  );
  res.json(row);
});

const remove = asyncHandler(async (req, res) => {
  await boardMemberService.removeBoardMember(req.app, req.userId, req.params.boardId, req.params.id);
  res.status(204).end();
});

module.exports = { list, add, update, remove };
