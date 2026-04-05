const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace", index: true },
    boardId: { type: mongoose.Schema.Types.ObjectId, ref: "Board", index: true },
    listId: { type: mongoose.Schema.Types.ObjectId, ref: "BoardList" },
    cardId: { type: mongoose.Schema.Types.ObjectId, ref: "Card" },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    action: { type: String, required: true },
    entityType: { type: String, required: true },
    oldData: { type: mongoose.Schema.Types.Mixed },
    newData: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

module.exports = mongoose.model("Activity", activitySchema);
