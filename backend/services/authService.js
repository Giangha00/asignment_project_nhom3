/**
 * Nghiệp vụ xác thực: đăng ký, đăng nhập, quên/đặt lại mật khẩu.
 *
 * - Mật khẩu chỉ lưu dạng hash (bcrypt), không lưu plaintext.
 * - Email có thể mã hóa/lookup trong DB (userModel + emailCrypto).
 * - JWT chứa sub (userId), email, fullName — dùng cho middleware và không cần tra DB mỗi request chỉ để biết id.
 * - UserSession: ghi phiên đăng nhập (refresh hash, userAgent, IP) phục vụ audit / refresh token sau này.
 */
const crypto = require("crypto");
const User = require("../models/userModel");
const UserSession = require("../models/userSessionModel");
const { signUserToken } = require("../middleware/auth");
const { HttpError } = require("../utils/httpError");

const MAX_FAILED_PASSWORD_BEFORE_SUGGEST = 5;
const emailCrypto = require("../utils/emailCrypto");


const MIN_PASSWORD_LEN = 6;

/** Chuẩn hóa dữ liệu đưa vào JWT (không chứa mật khẩu). */
function buildTokenPayload(user) {
  const plainUser = typeof user?.toJSON === "function" ? user.toJSON() : user;
  return {
    userId: String(user?._id || plainUser?._id || plainUser?.id || ""),
    email: plainUser?.email || "",
    fullName: plainUser?.fullName || "",
  };
}

/** Tên hiển thị phải có ít nhất một chữ cái Latin a-z (không chỉ số/ký tự đặc biệt). */
function assertFullNameHasLatinLetter(fullName) {
  const s = String(fullName || "").trim();
  if (!s) throw new HttpError(400, "Tên người dùng là bắt buộc");
  if (!/[a-zA-Z]/.test(s)) {
    throw new HttpError(400, "Tên người dùng phải có ít nhất một chữ cái (a-z).");
  }
}

/** Phần trước @gmail.com không được chỉ gồm chữ số (tránh đăng ký kiểu 012345@gmail.com). */
function assertGmailLocalNotDigitsOnly(normEmail) {
  const lower = String(normEmail || "").toLowerCase().trim();
  if (!lower.endsWith("@gmail.com")) return;
  const local = lower.slice(0, -"@gmail.com".length);
  if (local && /^\d+$/.test(local)) {
    throw new HttpError(400, "Phần tên trước @gmail.com không được chỉ gồm số.");
  }
}

/** Đăng ký: kiểm tra trùng email → hash password → tạo user → ký JWT. */
async function register({ email, password, fullName }) {
  if (!email || !password) throw new HttpError(400, "email and password required");
  assertFullNameHasLatinLetter(fullName);
  const norm = emailCrypto.normalizeEmail(email);
  assertGmailLocalNotDigitsOnly(norm);
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
 * Đăng nhập: tìm user theo email, so khớp mật khẩu, reset/tăng bộ đếm sai mật khẩu,
 * tạo bản ghi UserSession, trả JWT + refresh token thô (client giữ refresh nếu cần).
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

  // Refresh token lưu dạng hash trong DB; raw chỉ trả một lần cho client.
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

/** Bước quên mật khẩu: kiểm tra email tồn tại (tránh lộ danh sách email nếu muốn có thể luôn trả 200). */
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

/** Đặt mật khẩu mới theo email (sau khi đã qua bước xác minh ở tầng trên). */
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
