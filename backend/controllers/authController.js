const authService = require("../services/authService");
const userService = require("../services/userService");
const {
  AUTH_COOKIE_NAME,
  authMiddleware,
  buildAuthCookieOptions,
} = require("../middleware/auth");
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
  res.cookie(AUTH_COOKIE_NAME, result.token, buildAuthCookieOptions());
  res.json(result);
});

const logout = asyncHandler(async (_req, res) => {
  res.clearCookie(AUTH_COOKIE_NAME, {
    httpOnly: true,
    secure: buildAuthCookieOptions().secure,
    sameSite: buildAuthCookieOptions().sameSite,
    path: "/",
  });
  res.json({ ok: true });
});

const session = [
  authMiddleware,
  asyncHandler(async (req, res) => {
    const user = await userService.getMe(req.userId);
    res.json({ user });
  }),
];

const forgotPassword = asyncHandler(async (req, res) => {
  const result = await authService.requestForgotPassword(req.body || {});
  res.status(201).json(result);
});

const resetPassword = asyncHandler(async (req, res) => {
  await authService.resetPasswordForgot(req.body || {});
  res.json({ ok: true, message: "Đã đặt lại mật khẩu. Bạn có thể đăng nhập bằng mật khẩu mới." });
});

module.exports = { register, login, logout, session, forgotPassword, resetPassword };
