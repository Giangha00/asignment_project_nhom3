const attachmentService = require("../services/attachmentService");
const { asyncHandler } = require("../utils/asyncHandler");

const list = asyncHandler(async (req, res) => {
  const rows = await attachmentService.listAttachments(req.userId, req.query.cardId);
  res.json(rows);
});

const create = asyncHandler(async (req, res) => {
  const att = await attachmentService.createAttachment(req.app, req.userId, req.body);
  res.status(201).json(att);
});

const getOne = asyncHandler(async (req, res) => {
  const att = await attachmentService.getAttachment(req.userId, req.params.id);
  res.json(att);
});

const remove = asyncHandler(async (req, res) => {
  await attachmentService.deleteAttachment(req.app, req.userId, req.params.id);
  res.status(204).end();
});

module.exports = { list, create, getOne, remove };
