const Activity = require("../models/activitiesModel");
const Card = require("../models/cardModel");
const { HttpError } = require("../utils/httpError");
const { assertObjectId } = require("./validation");
const { getBoardWithAccess, isWorkspaceMember } = require("./accessService");

async function listActivities(userId, { boardId, workspaceId, cardId }) {
  if (boardId) {
    assertObjectId(boardId, "Invalid boardId");
    const board = await getBoardWithAccess(boardId, userId);
    if (!board) throw new HttpError(403, "Forbidden");
    return Activity.find({ boardId }).sort({ createdAt: -1 }).limit(200).lean();
  }
  if (workspaceId) {
    assertObjectId(workspaceId, "Invalid workspaceId");
    const ok = await isWorkspaceMember(workspaceId, userId);
    if (!ok) throw new HttpError(403, "Forbidden");
    return Activity.find({ workspaceId }).sort({ createdAt: -1 }).limit(200).lean();
  }
  if (cardId) {
    assertObjectId(cardId, "Invalid cardId");
    const card = await Card.findOne({ _id: cardId, deletedAt: null });
    if (!card) throw new HttpError(404, "Not found");
    const board = await getBoardWithAccess(card.boardId, userId);
    if (!board) throw new HttpError(403, "Forbidden");
    return Activity.find({ cardId }).sort({ createdAt: -1 }).limit(100).lean();
  }
  throw new HttpError(400, "boardId, workspaceId, or cardId query required");
}

async function createActivity(userId, body) {
  const { workspaceId, boardId, listId, cardId, action, entityType, oldData, newData } = body || {};
  if (!action || !entityType) throw new HttpError(400, "action and entityType required");
  if (boardId) {
    const board = await getBoardWithAccess(boardId, userId);
    if (!board) throw new HttpError(403, "Forbidden");
  } else if (workspaceId) {
    const ok = await isWorkspaceMember(workspaceId, userId);
    if (!ok) throw new HttpError(403, "Forbidden");
  } else {
    throw new HttpError(400, "boardId or workspaceId required");
  }
  return Activity.create({
    workspaceId,
    boardId,
    listId,
    cardId,
    userId,
    action,
    entityType,
    oldData,
    newData,
  });
}

async function getActivity(userId, id) {
  assertObjectId(id);
  const doc = await Activity.findById(id);
  if (!doc) throw new HttpError(404, "Not found");
  if (doc.boardId) {
    const board = await getBoardWithAccess(doc.boardId, userId);
    if (!board) throw new HttpError(403, "Forbidden");
  } else if (doc.workspaceId) {
    const ok = await isWorkspaceMember(doc.workspaceId, userId);
    if (!ok) throw new HttpError(403, "Forbidden");
  }
  return doc;
}

async function deleteActivity(userId, id) {
  await getActivity(userId, id);
  await Activity.deleteOne({ _id: id });
}

module.exports = { listActivities, createActivity, getActivity, deleteActivity };
