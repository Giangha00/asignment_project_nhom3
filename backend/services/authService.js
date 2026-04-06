const crypto = require("crypto");
const User = require("../models/userModel");
const UserSession = require("../models/userSessionModel");
const { signUserToken } = require("../middleware/auth");
const { HttpError } = require("../utils/httpError");
const otpRequestService = require("./otpRequestService");

const MIN_PASSWORD_LEN = 6;

async function register({ email, password, fullName }) {
  if (!email || !password) throw new HttpError(400, "email and password required");
  const exists = await User.findOne({ email: String(email).toLowerCase() });
  if (exists) throw new HttpError(409, "Email already registered");
  const passwordHash = await User.hashPassword(password);
  const user = await User.create({ email, passwordHash, fullName: fullName || "" });
  const token = signUserToken(String(user._id));
  return { user, token };
}

async function login({ email, password }, { userAgent = "", ip = "" } = {}) {
  if (!email || !password) throw new HttpError(400, "email and password required");
  const user = await User.findOne({ email: String(email).toLowerCase() }).select("+passwordHash");
  if (!user || user.deletedAt) throw new HttpError(401, "Invalid credentials");
  const ok = await user.comparePassword(password);
  if (!ok) throw new HttpError(401, "Invalid credentials");
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
  const user = await User.findOne({ email: String(email).toLowerCase() });
  if (!user || user.deletedAt) {
    throw new HttpError(404, "Không tìm thấy tài khoản với email này");
  }
  const otpResult = await otpRequestService.sendForgotPasswordOtp(user);
  return {
    message: "Đã gửi mã OTP tới email của bạn.",
    ...otpResult,
  };
}

async function resetPasswordWithForgotOtp({ email, otpCode, newPassword }) {
  if (!email || otpCode === undefined || otpCode === "" || !newPassword) {
    throw new HttpError(400, "email, otpCode và newPassword là bắt buộc");
  }
  if (String(newPassword).length < MIN_PASSWORD_LEN) {
    throw new HttpError(400, `Mật khẩu mới tối thiểu ${MIN_PASSWORD_LEN} ký tự`);
  }

  const normalized = String(email).toLowerCase();
  await otpRequestService.verifyOtpForEmail(normalized, "reset_password", otpCode);

  const user = await User.findOne({ email: normalized }).select("+passwordHash");
  if (!user || user.deletedAt) throw new HttpError(404, "Không tìm thấy tài khoản");

  user.passwordHash = await User.hashPassword(newPassword);
  user.emailVerified = true;
  await user.save();
}

module.exports = { register, login, requestForgotPassword, resetPasswordWithForgotOtp };
