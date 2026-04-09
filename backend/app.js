const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { HttpError, jsonBodyForHttpError } = require("./utils/httpError");

require("./models/userModel");
require("./models/userSessionModel");
require("./models/otpRequestModel");
require("./models/workSpaceModel");
require("./models/workSpaceMemberModel");
require("./models/boardModel");
require("./models/boardMemberModel");
require("./models/boardListModel");
require("./models/cardModel");
require("./models/cardMemberModel");
require("./models/labelsModel");
require("./models/cardLableModel");
require("./models/commentsModel");
require("./models/checklistModel");
require("./models/checklistItemModel");
require("./models/attachmentModel");
require("./models/activitiesModel");

const authRoutes = require("./routes/auth.routes");
const usersRoutes = require("./routes/users.routes");
const workspaceMembersRoutes = require("./routes/workspaceMembers.routes");
const workspacesRoutes = require("./routes/workspaces.routes");
const boardMembersRoutes = require("./routes/boardMembers.routes");
const boardsRoutes = require("./routes/boards.routes");
const boardListsRoutes = require("./routes/boardLists.routes");
const cardMembersRoutes = require("./routes/cardMembers.routes");
const cardsRoutes = require("./routes/cards.routes");
const labelsRoutes = require("./routes/labels.routes");
const cardLabelsRoutes = require("./routes/cardLabels.routes");
const commentsRoutes = require("./routes/comments.routes");
const checklistsRoutes = require("./routes/checklists.routes");
const checklistItemsRoutes = require("./routes/checklistItems.routes");
const attachmentsRoutes = require("./routes/attachments.routes");
const activitiesRoutes = require("./routes/activities.routes");
const userSessionsRoutes = require("./routes/userSessions.routes");
const otpRequestsRoutes = require("./routes/otpRequests.routes");

function createApp() {
  const app = express();
  app.use(cors({ origin: true, credentials: true }));
  app.use(cookieParser());
  app.use(express.json());

  app.get("/api/health", (_req, res) => res.json({ ok: true }));
  app.use("/api/auth", authRoutes);

  app.use("/api/workspaces/:workspaceId/members", workspaceMembersRoutes);
  app.use("/api/workspaces", workspacesRoutes);

  app.use("/api/boards/:boardId/members", boardMembersRoutes);
  app.use("/api/boards", boardsRoutes);

  app.use("/api/board-lists", boardListsRoutes);

  app.use("/api/cards/:cardId/assignees", cardMembersRoutes);
  app.use("/api/cards", cardsRoutes);

  app.use("/api/labels", labelsRoutes);
  app.use("/api/card-labels", cardLabelsRoutes);
  app.use("/api/comments", commentsRoutes);
  app.use("/api/checklists", checklistsRoutes);
  app.use("/api/checklist-items", checklistItemsRoutes);
  app.use("/api/attachments", attachmentsRoutes);
  app.use("/api/activities", activitiesRoutes);
  app.use("/api/sessions", userSessionsRoutes);
  app.use("/api/otp-requests", otpRequestsRoutes);
  app.use("/api/users", usersRoutes);

  app.use((err, _req, res, _next) => {
    if (err instanceof HttpError) {
      return res.status(err.status).json(jsonBodyForHttpError(err));
    }
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  });
  return app;
}

module.exports = { createApp };
