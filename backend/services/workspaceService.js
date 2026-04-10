const Workspace = require("../models/workSpaceModel");
const WorkspaceMember = require("../models/workSpaceMemberModel");
const { slugify } = require("../utils/slugify");
const { logActivity } = require("../utils/activityLog");
const { emitToWorkspace } = require("../utils/socketEmit");
const { HttpError } = require("../utils/httpError");
const { assertObjectId } = require("./validation");
const { isWorkspaceMember } = require("./accessService");

async function listMine(userId) {
  const members = await WorkspaceMember.find({
    userId,
    status: "active",
    deletedAt: null,
  })
    .populate("workspaceId")
    .lean();
  // Bỏ workspace đã soft-delete (populate vẫn trả document nếu member chưa được gỡ).
  return members
    .map((m) => m.workspaceId)
    .filter((ws) => ws && ws.deletedAt == null);
}

async function createWorkspace(app, userId, body) {
  const { name, description, visibility, logoUrl } = body || {};
  if (!name) throw new HttpError(400, "name required");
  let base = slugify(name);
  let slug = base;
  let n = 0;
  while (await Workspace.findOne({ slug, deletedAt: null })) {
    n += 1;
    slug = `${base}-${n}`;
  }
  const ws = await Workspace.create({
    name,
    slug,
    description: description || "",
    ownerId: userId,
    visibility: visibility || "private",
    logoUrl: logoUrl || "",
  });
  await WorkspaceMember.create({
    workspaceId: ws._id,
    userId,
    role: "admin",
    status: "active",
    joinedAt: new Date(),
  });
  await logActivity(app, {
    workspaceId: ws._id,
    userId,
    action: "workspace.created",
    entityType: "workspace",
    newData: ws.toJSON(),
  });
  emitToWorkspace(app, String(ws._id), "workspace:created", ws.toJSON());
  return ws;
}

async function getWorkspace(userId, id) {
  assertObjectId(id);
  const ok = await isWorkspaceMember(id, userId);
  if (!ok) throw new HttpError(403, "Forbidden");
  const ws = await Workspace.findOne({ _id: id, deletedAt: null });
  if (!ws) throw new HttpError(404, "Not found");
  return ws;
}

async function updateWorkspace(app, userId, id, body) {
  const ws = await getWorkspace(userId, id);
  const old = ws.toObject();
  const { name, description, visibility, logoUrl } = body || {};
  if (name !== undefined) ws.name = name;
  if (description !== undefined) ws.description = description;
  if (visibility !== undefined) ws.visibility = visibility;
  if (logoUrl !== undefined) ws.logoUrl = logoUrl;
  await ws.save();
  await logActivity(app, {
    workspaceId: ws._id,
    userId,
    action: "workspace.updated",
    entityType: "workspace",
    oldData: old,
    newData: ws.toJSON(),
  });
  emitToWorkspace(app, String(ws._id), "workspace:updated", ws.toJSON());
  return ws;
}

async function deleteWorkspace(app, userId, id) {
  assertObjectId(id);
  const ws = await Workspace.findOne({ _id: id, deletedAt: null });
  if (!ws) throw new HttpError(404, "Not found");
  if (String(ws.ownerId) !== String(userId)) throw new HttpError(403, "Only owner");
  ws.deletedAt = new Date();
  await ws.save();
  await WorkspaceMember.updateMany(
    { workspaceId: ws._id, deletedAt: null },
    { $set: { deletedAt: new Date(), status: "removed" } }
  );
  await logActivity(app, {
    workspaceId: ws._id,
    userId,
    action: "workspace.deleted",
    entityType: "workspace",
    oldData: ws.toJSON(),
  });
  emitToWorkspace(app, String(ws._id), "workspace:deleted", { id: ws._id });
}

module.exports = {
  listMine,
  createWorkspace,
  getWorkspace,
  updateWorkspace,
  deleteWorkspace,
};
