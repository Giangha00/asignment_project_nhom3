const BoardList = require("../models/boardListModel");
const { emitToBoard } = require("../utils/socketEmit");
const { HttpError } = require("../utils/httpError");
const { composeAspects } = require("../aspects/composeAspects");
const { withValidation } = require("../aspects/withValidation");
const { withAccessControl } = require("../aspects/withAccessControl");
const { withTransaction } = require("../aspects/withTransaction");
const { withAuditLog } = require("../aspects/withAuditLog");
const { withSocketEmit } = require("../aspects/withSocketEmit");
const { withErrorBoundary } = require("../aspects/withErrorBoundary");
const { assertObjectId } = require("./validation");
const { getBoardWithAccess } = require("./accessService");

function createMutationContext(app, userId, params = {}, body = {}) {
  return {
    app,
    userId,
    params,
    body,
    session: null,
    resources: {},
    meta: {},
  };
}

async function requireBoardAccess(boardId, userId) {
  const board = await getBoardWithAccess(boardId, userId);
  if (!board) throw new HttpError(403, "Forbidden");
  return board;
}

async function loadListWithAccess(userId, id) {
  assertObjectId(id);
  const list = await BoardList.findOne({ _id: id, deletedAt: null });
  if (!list) throw new HttpError(404, "Not found");
  const board = await requireBoardAccess(list.boardId, userId);
  return { list, board };
}

async function listLists(userId, boardId) {
  if (!boardId) throw new HttpError(400, "boardId query required");
  assertObjectId(boardId, "Invalid boardId");
  await requireBoardAccess(boardId, userId);
  return BoardList.find({ boardId, deletedAt: null }).sort({ position: 1, createdAt: 1 }).lean();
}

async function getList(userId, id) {
  const { list } = await loadListWithAccess(userId, id);
  return list;
}

const createListMutation = composeAspects(
  async (ctx) => {
    const { boardId, name, position } = ctx.body;
    const list = await BoardList.create({
      boardId,
      name,
      position: position ?? 0,
      createdBy: ctx.userId,
    });
    ctx.resources.list = list;
    return list;
  },
  [
    withErrorBoundary(),
    withValidation((ctx) => {
      const { boardId, name } = ctx.body || {};
      if (!boardId || !name) throw new HttpError(400, "boardId and name required");
      assertObjectId(boardId, "Invalid boardId");
    }),
    withAccessControl(async (ctx) => {
      ctx.resources.board = await requireBoardAccess(ctx.body.boardId, ctx.userId);
    }),
    withSocketEmit({
      emit: (ctx, list) => {
        emitToBoard(ctx.app, ctx.body.boardId, "list:created", list.toJSON());
      },
    }),
    withAuditLog({
      buildActivity: async (ctx, list) => ({
        workspaceId: ctx.resources.board.workspaceId,
        boardId: ctx.body.boardId,
        listId: list._id,
        userId: ctx.userId,
        action: "list.created",
        entityType: "board_list",
        newData: list.toJSON(),
      }),
    }),
    withTransaction(),
  ]
);

async function createList(app, userId, body) {
  return createListMutation(createMutationContext(app, userId, {}, body || {}));
}

const updateListMutation = composeAspects(
  async (ctx) => {
    const list = ctx.resources.list;
    const { name, position, isArchived, archivedAt } = ctx.body || {};
    ctx.meta.oldData = list.toObject();
    if (name !== undefined) list.name = name;
    if (position !== undefined) list.position = position;
    if (isArchived !== undefined) list.isArchived = isArchived;
    if (archivedAt !== undefined) list.archivedAt = archivedAt ? new Date(archivedAt) : null;
    await list.save();
    return list;
  },
  [
    withErrorBoundary(),
    withValidation((ctx) => {
      assertObjectId(ctx.params.id);
    }),
    withAccessControl(async (ctx) => {
      const { list, board } = await loadListWithAccess(ctx.userId, ctx.params.id);
      ctx.resources.list = list;
      ctx.resources.board = board;
    }),
    withSocketEmit({
      emit: (ctx, list) => {
        emitToBoard(ctx.app, String(list.boardId), "list:updated", list.toJSON());
      },
    }),
    withAuditLog({
      buildActivity: async (ctx, list) => ({
        workspaceId: ctx.resources.board.workspaceId,
        boardId: list.boardId,
        listId: list._id,
        userId: ctx.userId,
        action: "list.updated",
        entityType: "board_list",
        oldData: ctx.meta.oldData,
        newData: list.toJSON(),
      }),
    }),
    withTransaction(),
  ]
);

async function updateList(app, userId, id, body) {
  return updateListMutation(createMutationContext(app, userId, { id }, body || {}));
}

const deleteListMutation = composeAspects(
  async (ctx) => {
    const list = ctx.resources.list;
    list.deletedAt = new Date();
    await list.save();
    return list;
  },
  [
    withErrorBoundary(),
    withValidation((ctx) => {
      assertObjectId(ctx.params.id);
    }),
    withAccessControl(async (ctx) => {
      const { list, board } = await loadListWithAccess(ctx.userId, ctx.params.id);
      ctx.resources.list = list;
      ctx.resources.board = board;
      ctx.meta.oldData = list.toJSON();
    }),
    withSocketEmit({
      emit: (ctx) => {
        emitToBoard(ctx.app, String(ctx.resources.list.boardId), "list:deleted", { id: ctx.params.id });
      },
    }),
    withAuditLog({
      buildActivity: async (ctx) => ({
        workspaceId: ctx.resources.board.workspaceId,
        boardId: ctx.resources.list.boardId,
        listId: ctx.params.id,
        userId: ctx.userId,
        action: "list.deleted",
        entityType: "board_list",
        oldData: ctx.meta.oldData,
      }),
    }),
    withTransaction(),
  ]
);

async function deleteList(app, userId, id) {
  await deleteListMutation(createMutationContext(app, userId, { id }));
}

module.exports = { listLists, createList, getList, updateList, deleteList };
