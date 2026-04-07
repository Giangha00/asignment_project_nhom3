const crypto = require("crypto");
const OtpRequest = require("../models/otpRequestModel");
const User = require("../models/userModel");
const { HttpError } = require("../utils/httpError");
const { assertObjectId } = require("./validation");
const mailService = require("./mailService");

function hashOtpCode(raw) {
  return crypto.createHash("sha256").update(String(raw).trim()).digest("hex");
}

async function createAndSendOtp({ userId, email, otpType }) {
  const normalizedEmail = String(email).toLowerCase().trim();
  const otpRaw = String(Math.floor(100000 + Math.random() * 900000));
  const otpCodeHash = hashOtpCode(otpRaw);
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
  const doc = await OtpRequest.create({
    userId,
    email: normalizedEmail,
    otpCodeHash,
    otpType,
    expiresAt,
  });

  const isProd = process.env.NODE_ENV === "production";
  let emailSent = false;

  if (mailService.isMailConfigured()) {
    try {
      await mailService.sendOtpEmail({
        to: doc.email,
        code: otpRaw,
        otpType,
      });
      emailSent = true;
    } catch (err) {
      console.error("[otp] gửi email thất bại:", err.message);
      if (isProd) {
        await OtpRequest.deleteOne({ _id: doc._id });
        throw new HttpError(502, "Không gửi được email. Thử lại sau.");
      }
    }
  } else if (isProd) {
    await OtpRequest.deleteOne({ _id: doc._id });
    throw new HttpError(503, "Chưa cấu hình SMTP; không thể gửi OTP.");
  }

  return {
    id: doc._id,
    expiresAt,
    emailSent,
    devOtp: !isProd && !emailSent ? otpRaw : undefined,
  };
}

async function listOtpRequests(userId) {
  return OtpRequest.find({ userId }).sort({ createdAt: -1 }).limit(50).lean();
}

async function createOtpRequest(userId, body) {
  const { email, otpType, userId: bodyUserId } = body || {};
  if (!email || !otpType) throw new HttpError(400, "email and otpType required");
  return createAndSendOtp({
    userId: bodyUserId || userId,
    email,
    otpType,
  });
}

/** Gửi OTP tới email đăng ký của user đang đăng nhập (đổi mật khẩu). */
async function sendPasswordChangeOtp(userId) {
  const user = await User.findById(userId);
  if (!user || user.deletedAt) throw new HttpError(404, "Not found");
  return createAndSendOtp({
    userId,
    email: user.getPlainEmail(),
    otpType: "change_password",
  });
}

/**
 * Xác thực mã OTP (6 số), đánh dấu đã dùng. Dùng trước khi đổi mật khẩu.
 */
async function verifyOtpForUser(userId, email, otpType, rawCode) {
  const code = String(rawCode || "").replace(/\s/g, "");
  if (!/^\d{6}$/.test(code)) throw new HttpError(400, "Mã OTP phải gồm 6 chữ số");

  const normalizedEmail = String(email).toLowerCase().trim();
  const row = await OtpRequest.findOne({
    userId,
    email: normalizedEmail,
    otpType,
    status: "pending",
  }).sort({ createdAt: -1 });

  if (!row) throw new HttpError(400, "Không có mã OTP hợp lệ. Hãy yêu cầu gửi lại mã.");
  if (row.expiresAt < new Date()) {
    row.status = "expired";
    await row.save();
    throw new HttpError(400, "Mã OTP đã hết hạn");
  }
  if (row.attemptCount >= row.maxAttempts) {
    throw new HttpError(429, "Đã vượt quá số lần nhập sai cho mã này");
  }

  if (hashOtpCode(code) !== row.otpCodeHash) {
    row.attemptCount += 1;
    await row.save();
    throw new HttpError(400, "Mã OTP không đúng");
  }

  row.status = "used";
  await row.save();
  return row;
}

/**
 * Xác thực OTP theo email (quên mật khẩu), không cần JWT.
 */
async function verifyOtpForEmail(email, otpType, rawCode) {
  const code = String(rawCode || "").replace(/\s/g, "");
  if (!/^\d{6}$/.test(code)) throw new HttpError(400, "Mã OTP phải gồm 6 chữ số");

  const normalizedEmail = String(email).toLowerCase().trim();
  const row = await OtpRequest.findOne({
    email: normalizedEmail,
    otpType,
    status: "pending",
  }).sort({ createdAt: -1 });

  if (!row) throw new HttpError(400, "Không có mã OTP hợp lệ. Hãy yêu cầu gửi lại mã.");
  if (row.expiresAt < new Date()) {
    row.status = "expired";
    await row.save();
    throw new HttpError(400, "Mã OTP đã hết hạn");
  }
  if (row.attemptCount >= row.maxAttempts) {
    throw new HttpError(429, "Đã vượt quá số lần nhập sai cho mã này");
  }

  if (hashOtpCode(code) !== row.otpCodeHash) {
    row.attemptCount += 1;
    await row.save();
    throw new HttpError(400, "Mã OTP không đúng");
  }

  row.status = "used";
  await row.save();
  return row;
}

function assertOtpOwner(row, userId) {
  if (row.userId && String(row.userId) !== String(userId)) {
    throw new HttpError(403, "Forbidden");
  }
}

async function getOtpRequest(userId, id) {
  assertObjectId(id);
  const row = await OtpRequest.findById(id);
  if (!row) throw new HttpError(404, "Not found");
  assertOtpOwner(row, userId);
  return row;
}

async function updateOtpRequest(userId, id, body) {
  const row = await getOtpRequest(userId, id);
  const { status, attemptCount } = body || {};
  if (status !== undefined) row.status = status;
  if (attemptCount !== undefined) row.attemptCount = attemptCount;
  await row.save();
  return row;
}

async function deleteOtpRequest(userId, id) {
  const row = await OtpRequest.findById(id);
  if (!row) throw new HttpError(404, "Not found");
  assertOtpOwner(row, userId);
  await OtpRequest.deleteOne({ _id: id });
}

module.exports = {
  listOtpRequests,
  createOtpRequest,
  sendPasswordChangeOtp,
  verifyOtpForUser,
  verifyOtpForEmail,
  getOtpRequest,
  updateOtpRequest,
  deleteOtpRequest,
};
