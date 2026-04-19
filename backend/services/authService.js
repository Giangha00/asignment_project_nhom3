/**
 * Nghiệp vụ xác thực (pure logic, không gắn req/res):
 * đăng ký, đăng nhập, quên/đặt mật khẩu.
 *
 * Mật khẩu: chỉ lưu bcrypt hash trong User.passwordHash.
 * JWT: signUserToken(buildTokenPayload(user)) — không đưa mật khẩu vào token.
 */
const crypto = require("crypto");
const User = require("../models/userModel");
const UserSession = require("../models/userSessionModel");
const { signUserToken } = require("../middleware/auth");
const { HttpError } = require("../utils/httpError");

/** Sau số lần nhập sai mật khẩu này, response có thể gợi ý đổi mật khẩu */
const MAX_FAILED_PASSWORD_BEFORE_SUGGEST = 5;
const emailCrypto = require("../utils/emailCrypto");

const MIN_PASSWORD_LEN = 6;

/**
 * Dữ liệu đưa vào JWT: userId (Mongo _id dạng string), email, fullName.
 * Không chứa password hay dữ liệu nhạy cảm khác.
 */
function buildTokenPayload(user) {
  const plainUser = typeof user?.toJSON === "function" ? user.toJSON() : user;
  return {
    userId: String(user?._id || plainUser?._id || plainUser?.id || ""),
    email: plainUser?.email || "",
    fullName: plainUser?.fullName || "",
  };
}

/**
 * Đăng ký tài khoản mới.
 * - Kiểm tra email chưa tồn tại
 * - Hash password bằng bcrypt
 * - Tạo document User
 * - Ký JWT và trả { user, token } — controller register KHÔNG set cookie (client tự login sau)
 */
async function register({ email, password, fullName }) {
  if (!email || !password) throw new HttpError(400, "email and password required");
  const norm = emailCrypto.normalizeEmail(email);
  const fields = User.buildEmailFields(email);
  const exists = await User.findOne({
    $or: [{ emailLookup: fields.emailLookup }, { email: norm }],
  });
  if (exists) throw new HttpError(409, "Email already registered");
  const passwordHash = await User.hashPassword(password);
  const user = await User.create({
    ...fields,
    email: norm,
    passwordHash,
    fullName: fullName || "",
  });
  const token = signUserToken(buildTokenPayload(user));
  return { user: user.toJSON(), token };
}

/**
 * Đăng nhập: xác thực email + mật khẩu, trả JWT + (tuỳ chọn) refresh token.
 *
 * Luồng:
 * 1) Chuẩn hóa email giống lúc lưu DB
 * 2) Tìm user + lấy passwordHash để so sánh
 * 3) Sai mật khẩu: tăng failedPasswordAttempts, có thể gợi ý forgot-password
 * 4) Đúng: reset bộ đếm, cập nhật lastLoginAt
 * 5) Tạo refresh token ngẫu nhiên, chỉ lưu hash trong UserSession (raw trả 1 lần cho client)
 * 6) Ký JWT access (7 ngày) — controller sẽ set cookie + json cùng token đó
 */
async function login({ email, password }, { userAgent = "", ip = "" } = {}) {
  if (!email || !password) throw new HttpError(400, "email and password required");
  const normalizedEmail = emailCrypto.normalizeEmail(email);
  const user = await User.findByEmailInput(normalizedEmail, "+passwordHash");
  if (!user || user.deletedAt) throw new HttpError(401, "Invalid credentials");
  const storedEmail = emailCrypto.normalizeEmail(
    user.email ||
      (typeof user.getPlainEmail === "function" ? user.getPlainEmail() : "")
  );
  if (storedEmail !== normalizedEmail) {
    throw new HttpError(401, "Invalid credentials");
  }
  const ok = await user.comparePassword(password);
  if (!ok) {
    user.failedPasswordAttempts = (user.failedPasswordAttempts || 0) + 1;
    await user.save();
    if (user.failedPasswordAttempts >= MAX_FAILED_PASSWORD_BEFORE_SUGGEST) {
      throw new HttpError(401, "Invalid credentials", {
        suggestPasswordChange: true,
        suggestion:
          "This email is registered. You have entered the wrong password several times; consider resetting your password via forgot-password.",
      });
    }
    throw new HttpError(401, "Invalid credentials");
  }
  user.failedPasswordAttempts = 0;
  user.lastLoginAt = new Date();
  await user.save();

  const refreshRaw = crypto.randomBytes(48).toString("hex");
  const refreshTokenHash = crypto.createHash("sha256").update(refreshRaw).digest("hex");
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await UserSession.create({
    userId: user._id,
    refreshTokenHash,
    userAgent,
    ipAddress: ip,
    expiresAt,
  });

  const token = signUserToken(buildTokenPayload(user));
  return {
    user: user.toJSON(),
    token,
    refreshToken: refreshRaw,
    refreshExpiresAt: expiresAt,
  };
}

/** Quên mật khẩu: chỉ kiểm tra email có user (có thể mở rộng gửi email OTP) */
async function requestForgotPassword({ email }) {
  if (!email) throw new HttpError(400, "email required");
  const user = await User.findByEmailInput(email);
  if (!user || user.deletedAt) {
    throw new HttpError(404, "Không tìm thấy tài khoản với email này");
  }
  return {
    message: "Email hợp lệ. Bạn có thể đặt lại mật khẩu.",
  };
}

/** Đặt mật khẩu mới theo email (sau khi đã xác minh ở luồng forgot-password / OTP) */
async function resetPasswordForgot({ email, newPassword }) {
  if (!email || !newPassword) {
    throw new HttpError(400, "email và newPassword là bắt buộc");
  }
  if (String(newPassword).length < MIN_PASSWORD_LEN) {
    throw new HttpError(400, `Mật khẩu mới tối thiểu ${MIN_PASSWORD_LEN} ký tự`);
  }

  const user = await User.findByEmailInput(email, "+passwordHash");
  if (!user || user.deletedAt) throw new HttpError(404, "Không tìm thấy tài khoản");

  user.passwordHash = await User.hashPassword(newPassword);
  user.emailVerified = true;
  user.failedPasswordAttempts = 0;
  await user.save();
}

module.exports = { register, login, requestForgotPassword, resetPasswordForgot };
