const authService = require("../services/authService");
const { asyncHandler } = require("../utils/asyncHandler");

const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body || {});
  res.status(201).json(result);
});

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body || {}, {
    userAgent: req.headers["user-agent"] || "",
    ip: req.ip || "",
  });
  res.json(result);
});

const forgotPassword = asyncHandler(async (req, res) => {
  const result = await authService.requestForgotPassword(req.body || {});
  res.status(201).json(result);
});

const resetPassword = asyncHandler(async (req, res) => {
  await authService.resetPasswordForgot(req.body || {});
  res.json({ ok: true, message: "Đã đặt lại mật khẩu. Bạn có thể đăng nhập bằng mật khẩu mới." });
});

module.exports = { register, login, forgotPassword, resetPassword };
