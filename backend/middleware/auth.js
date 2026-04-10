/**
 * JWT & middleware bảo vệ API.
 *
 * - Đọc token: ưu tiên cookie `accessToken` (httpOnly), sau đó header `Authorization: Bearer ...`.
 * - Payload chuẩn: `sub` = Mongo user id; thêm email, fullName để tiện hiển thị (không thay thế tra DB khi cần dữ liệu đầy đủ).
 * - Cookie: httpOnly giảm rủi ro XSS đánh cắp token; secure + sameSite theo môi trường production.
 */
const jwt = require("jsonwebtoken");

const AUTH_COOKIE_NAME = "accessToken";

function getJwtSecret() {
  return process.env.JWT_SECRET || "dev-only-change-me";
}

function isProduction() {
  return process.env.NODE_ENV === "production";
}

/** Tuỳ chọn cookie JWT: thời hạn 7 ngày, path toàn site API. */
function buildAuthCookieOptions() {
  return {
    httpOnly: true,
    secure: isProduction(),
    sameSite: isProduction() ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  };
}

/** Lấy chuỗi JWT thô từ cookie hoặc Bearer. */
function readTokenFromRequest(req) {
  const tokenFromCookie = req.cookies?.[AUTH_COOKIE_NAME];
  if (tokenFromCookie) return tokenFromCookie;

  const authorizationHeader = req.headers.authorization;
  if (authorizationHeader?.startsWith("Bearer ")) {
    return authorizationHeader.slice(7);
  }

  return "";
}

/**
 * Bắt buộc request có JWT hợp lệ → gắn `req.userId` (từ `payload.sub`) cho controller/service sau.
 * Các route workspace/board/... dùng middleware này để chỉ user đăng nhập mới thao tác được.
 */
function authMiddleware(req, res, next) {
  const token = readTokenFromRequest(req);
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const payload = jwt.verify(token, getJwtSecret());
    req.userId = payload.sub;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

/** Ký JWT access token (hết hạn 7d). `userId` map vào claim `sub` (chuẩn OIDC-style). */
function signUserToken({ userId, email = "", fullName = "" }) {
  return jwt.sign(
    {
      sub: userId,
      email,
      fullName,
    },
    getJwtSecret(),
    { expiresIn: "7d" }
  );
}

module.exports = {
  AUTH_COOKIE_NAME,
  authMiddleware,
  buildAuthCookieOptions,
  getJwtSecret,
  signUserToken,
};
