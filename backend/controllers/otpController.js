const otpRequestService = require("../services/otpRequestService");
const { asyncHandler } = require("../utils/asyncHandler");

const listMine = asyncHandler(async (req, res) => {
  const rows = await otpRequestService.listOtpRequests(req.userId);
  res.json(rows);
});

const create = asyncHandler(async (req, res) => {
  const result = await otpRequestService.createOtpRequest(req.userId, req.body);
  res.status(201).json(result);
});

const getOne = asyncHandler(async (req, res) => {
  const row = await otpRequestService.getOtpRequest(req.userId, req.params.id);
  res.json(row);
});

const update = asyncHandler(async (req, res) => {
  const row = await otpRequestService.updateOtpRequest(req.userId, req.params.id, req.body);
  res.json(row);
});

const remove = asyncHandler(async (req, res) => {
  await otpRequestService.deleteOtpRequest(req.userId, req.params.id);
  res.status(204).end();
});

module.exports = { listMine, create, getOne, update, remove };
