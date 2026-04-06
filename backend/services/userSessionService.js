const UserSession = require("../models/userSessionModel");
const { HttpError } = require("../utils/httpError");
const { assertObjectId } = require("./validation");

async function listSessions(userId) {
  return UserSession.find({ userId }).sort({ createdAt: -1 }).limit(50).lean();
}

async function getSession(userId, id) {
  assertObjectId(id);
  const row = await UserSession.findOne({ _id: id, userId });
  if (!row) throw new HttpError(404, "Not found");
  return row;
}

async function revokeSession(userId, id) {
  const row = await getSession(userId, id);
  row.isRevoked = true;
  row.revokedAt = new Date();
  await row.save();
  return row;
}

async function deleteSession(userId, id) {
  assertObjectId(id);
  const r = await UserSession.deleteOne({ _id: id, userId });
  if (!r.deletedCount) throw new HttpError(404, "Not found");
}

module.exports = { listSessions, getSession, revokeSession, deleteSession };
