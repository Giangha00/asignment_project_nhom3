const Workspace = require("../models/workSpaceModel");
const WorkspaceMember = require("../models/workSpaceMemberModel");
const User = require("../models/userModel");
const { emitToWorkspace, emitToUser } = require("../utils/socketEmit");
const { HttpError } = require("../utils/httpError");
const { assertObjectId } = require("./validation");
const { isWorkspaceMember } = require("./accessService");

async function listMembers(userId, workspaceId) {
  assertObjectId(workspaceId, "Invalid id");
  const ok = await isWorkspaceMember(workspaceId, userId);
  if (!ok) throw new HttpError(403, "Forbidden");
  return WorkspaceMember.find({ workspaceId, deletedAt: null }).populate("userId").lean();
}

async function addMember(app, actorUserId, workspaceId, body) {
  const { userId: targetUserId, role } = body || {};
  assertObjectId(workspaceId, "Invalid id");
  assertObjectId(targetUserId, "workspaceId and userId required");
  const ws = await Workspace.findOne({ _id: workspaceId, deletedAt: null });
  if (!ws) throw new HttpError(404, "Workspace not found");
  const admin = await isWorkspaceMember(workspaceId, actorUserId);
  if (!admin) throw new HttpError(403, "Forbidden");
  const target = await User.findById(targetUserId);
  if (!target || target.deletedAt) throw new HttpError(404, "User not found");
  const row = await WorkspaceMember.findOneAndUpdate(
    { workspaceId, userId: targetUserId },
    {
      $set: {
        role: role || "member",
        status: "active",
        invitedBy: actorUserId,
        joinedAt: new Date(),
        deletedAt: null,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  const payload = row.toJSON();
  emitToWorkspace(app, workspaceId, "workspaceMember:upserted", payload);
  emitToUser(app, targetUserId, "workspaceMember:upserted", payload);
  return row;
}

async function updateMember(app, actorUserId, workspaceId, memberId, body) {
  assertObjectId(workspaceId, "Invalid id");
  assertObjectId(memberId, "Invalid id");
  const ok = await isWorkspaceMember(workspaceId, actorUserId);
  if (!ok) throw new HttpError(403, "Forbidden");
  const row = await WorkspaceMember.findOne({ _id: memberId, workspaceId, deletedAt: null });
  if (!row) throw new HttpError(404, "Not found");
  const { role, status } = body || {};
  if (role !== undefined) row.role = role;
  if (status !== undefined) row.status = status;
  await row.save();
  emitToWorkspace(app, workspaceId, "workspaceMember:updated", row.toJSON());
  return row;
}

async function removeMember(app, actorUserId, workspaceId, memberId) {
  assertObjectId(workspaceId, "Invalid id");
  assertObjectId(memberId, "Invalid id");
  const ok = await isWorkspaceMember(workspaceId, actorUserId);
  if (!ok) throw new HttpError(403, "Forbidden");
  const row = await WorkspaceMember.findOne({ _id: memberId, workspaceId, deletedAt: null });
  if (!row) throw new HttpError(404, "Not found");
  row.deletedAt = new Date();
  row.status = "removed";
  await row.save();
  emitToWorkspace(app, workspaceId, "workspaceMember:removed", { id: row._id });
}

async function backfillMissingLastActive() {
  const now = new Date();
  const result = await WorkspaceMember.updateMany(
    { $or: [{ lastActive: { $exists: false } }, { lastActive: null }] },
    { $set: { lastActive: now } }
  );
  return result.modifiedCount || 0;
}

module.exports = { listMembers, addMember, updateMember, removeMember, backfillMissingLastActive };
