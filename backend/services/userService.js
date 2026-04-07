const User = require("../models/userModel");
const emailCrypto = require("../utils/emailCrypto");
const { HttpError } = require("../utils/httpError");
const { assertObjectId } = require("./validation");
const otpRequestService = require("./otpRequestService");

async function getByIdOrThrow(id, { allowDeleted = false } = {}) {
  assertObjectId(id);
  const user = await User.findById(id);
  if (!user || (!allowDeleted && user.deletedAt)) throw new HttpError(404, "Not found");
  return user;
}

async function getMe(userId) {
  return getByIdOrThrow(userId);
}

async function updateMe(userId, body) {
  const { fullName, avatarUrl, status } = body || {};
  const user = await getByIdOrThrow(userId);
  if (fullName !== undefined) user.fullName = fullName;
  if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
  if (status !== undefined) user.status = status;
  await user.save();
  return user;
}

async function listUsers() {
  const rows = await User.find({ deletedAt: null }).limit(200).lean();
  return rows.map((r) => {
    const email = r.emailEncrypted
      ? emailCrypto.decryptEmail(r.emailEncrypted)
      : r.email || "";
    const { emailEncrypted, emailLookup, ...rest } = r;
    delete rest.failedPasswordAttempts;
    return { ...rest, email };
  });
}

async function softDeleteUser(id) {
  const user = await User.findById(id);
  if (!user) throw new HttpError(404, "Not found");
  user.deletedAt = new Date();
  await user.save();
}

const MIN_PASSWORD_LEN = 6;

async function changePasswordWithOtp(userId, body) {
  const { newPassword, otpCode } = body || {};
  if (!newPassword || otpCode === undefined || otpCode === "") {
    throw new HttpError(400, "newPassword và otpCode là bắt buộc");
  }
  if (String(newPassword).length < MIN_PASSWORD_LEN) {
    throw new HttpError(400, `Mật khẩu mới tối thiểu ${MIN_PASSWORD_LEN} ký tự`);
  }

  const user = await User.findById(userId).select("+passwordHash");
  if (!user || user.deletedAt) throw new HttpError(404, "Not found");

  await otpRequestService.verifyOtpForUser(userId, user.getPlainEmail(), "change_password", otpCode);

  user.passwordHash = await User.hashPassword(newPassword);
  user.emailVerified = true;
  user.failedPasswordAttempts = 0;
  await user.save();
}

module.exports = {
  getMe,
  updateMe,
  getByIdOrThrow,
  listUsers,
  softDeleteUser,
  changePasswordWithOtp,
};
