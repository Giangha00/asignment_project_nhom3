const userService = require("../services/userService");
const otpRequestService = require("../services/otpRequestService");
const { asyncHandler } = require("../utils/asyncHandler");

const getMe = asyncHandler(async (req, res) => {
  const user = await userService.getMe(req.userId);
  res.json(user);
});

const updateMe = asyncHandler(async (req, res) => {
  const user = await userService.updateMe(req.userId, req.body);
  res.json(user);
});

const getById = asyncHandler(async (req, res) => {
  const user = await userService.getByIdOrThrow(req.params.id);
  res.json(user);
});

const list = asyncHandler(async (_req, res) => {
  const users = await userService.listUsers();
  res.json(users);
});

const remove = asyncHandler(async (req, res) => {
  await userService.softDeleteUser(req.params.id);
  res.status(204).end();
});

/** Bước 1: gửi OTP về email đăng ký để xác nhận đổi mật khẩu. */
const sendPasswordChangeOtp = asyncHandler(async (req, res) => {
  const result = await otpRequestService.sendPasswordChangeOtp(req.userId);
  res.status(201).json({
    message: "Đã gửi mã OTP tới email đăng ký của tài khoản",
    ...result,
  });
});

/** Bước 2: nhập mã OTP + mật khẩu mới. */
const changePasswordWithOtp = asyncHandler(async (req, res) => {
  await userService.changePasswordWithOtp(req.userId, req.body);
  res.json({ ok: true, message: "Đã đổi mật khẩu thành công" });
});

module.exports = {
  getMe,
  updateMe,
  getById,
  list,
  remove,
  sendPasswordChangeOtp,
  changePasswordWithOtp,
};
