/**
 * Controller xử lý HTTP cho auth: gọi authService / userService, set/xóa cookie JWT.
 * Cookie `accessToken` dùng cho trình duyệt (httpOnly); response JSON cũng có `token` nếu client cần gửi Bearer.
 */
const authService = require("../services/authService");
const userService = require("../services/userService");
const {
  AUTH_COOKIE_NAME,
  authMiddleware,
  buildAuthCookieOptions,
} = require("../middleware/auth");
const { asyncHandler } = require("../utils/asyncHandler");

/** Đăng ký: tạo user trong DB, trả { user, token } (chưa set cookie — thường client chuyển sang login). */
const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body || {});
  res.status(201).json(result);
});

/** Đăng nhập: xác thực mật khẩu, ghi cookie JWT, trả user + token (+ refresh token phục vụ phiên dài hạn). */
const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body || {}, {
    userAgent: req.headers["user-agent"] || "",
    ip: req.ip || "",
  });
  res.cookie(AUTH_COOKIE_NAME, result.token, buildAuthCookieOptions());
  res.json(result);
});

/** Đăng xuất: xóa cookie accessToken (cùng thuộc tính path/sameSite như lúc set). */
const logout = asyncHandler(async (_req, res) => {
  res.clearCookie(AUTH_COOKIE_NAME, {
    httpOnly: true,
    secure: buildAuthCookieOptions().secure,
    sameSite: buildAuthCookieOptions().sameSite,
    path: "/",
  });
  res.json({ ok: true });
});

/**
 * Phiên đăng nhập: bắt buộc JWT hợp lệ → lấy userId từ token → load user đầy đủ từ MongoDB.
 * Dùng khi app mở lại / F5 để biết ai đang đăng nhập.
 */
const session = [
  authMiddleware,
  asyncHandler(async (req, res) => {
    const user = await userService.getMe(req.userId);
    res.json({ user });
  }),
];

/** Quên mật khẩu: chỉ xác nhận email có tài khoản (luồng mở rộng có thể gửi OTP/email). */
const forgotPassword = asyncHandler(async (req, res) => {
  const result = await authService.requestForgotPassword(req.body || {});
  res.status(201).json(result);
});

/** Đặt lại mật khẩu theo email (sau khi đã xác minh qua OTP hoặc luồng riêng của app). */
const resetPassword = asyncHandler(async (req, res) => {
  await authService.resetPasswordForgot(req.body || {});
  res.json({ ok: true, message: "Đã đặt lại mật khẩu. Bạn có thể đăng nhập bằng mật khẩu mới." });
});

module.exports = { register, login, logout, session, forgotPassword, resetPassword };
