const crypto = require("crypto");
const User = require("../models/userModel");
const UserSession = require("../models/userSessionModel");
const { signUserToken } = require("../middleware/auth");
const { HttpError } = require("../utils/httpError");

const MAX_FAILED_PASSWORD_BEFORE_SUGGEST = 5;
const emailCrypto = require("../utils/emailCrypto");

const MIN_PASSWORD_LEN = 6;

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
  const token = signUserToken(String(user._id));
  return { user, token };
}

async function login({ email, password }, { userAgent = "", ip = "" } = {}) {
  if (!email || !password) throw new HttpError(400, "email and password required");
  const user = await User.findByEmailInput(email, "+passwordHash");
  if (!user || user.deletedAt) throw new HttpError(401, "Invalid credentials");
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

  const token = signUserToken(String(user._id));
  return {
    user: user.toJSON(),
    token,
    refreshToken: refreshRaw,
    refreshExpiresAt: expiresAt,
  };
}

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
