const cardService = require("../services/cardService");
const { asyncHandler } = require("../utils/asyncHandler");

const list = asyncHandler(async (req, res) => {
  const cards = await cardService.listCards(req.userId, {
    listId: req.query.listId,
    boardId: req.query.boardId,
  });
  res.json(cards);
});

const create = asyncHandler(async (req, res) => {
  const card = await cardService.createCard(req.app, req.userId, req.body);
  res.status(201).json(card);
});

const getOne = asyncHandler(async (req, res) => {
  const card = await cardService.getCard(req.userId, req.params.id);
  res.json(card);
});

const update = asyncHandler(async (req, res) => {
  const card = await cardService.updateCard(req.app, req.userId, req.params.id, req.body);
  res.json(card);
});

const remove = asyncHandler(async (req, res) => {
  await cardService.deleteCard(req.app, req.userId, req.params.id);
  res.status(204).end();
});

module.exports = { list, create, getOne, update, remove };
