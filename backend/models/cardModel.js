const mongoose = require("mongoose");

const cardSchema = new mongoose.Schema(
  {
    listId: { type: mongoose.Schema.Types.ObjectId, ref: "BoardList", required: true, index: true },
    boardId: { type: mongoose.Schema.Types.ObjectId, ref: "Board", required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    position: { type: Number, default: 0 },
    priority: { type: String, enum: ["low", "medium", "high", "urgent"], default: "medium" },
    startAt: { type: Date },
    dueAt: { type: Date },
    completedAt: { type: Date },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    isArchived: { type: Boolean, default: false },
    archivedAt: { type: Date },
    deletedAt: { type: Date, default: null, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Card", cardSchema);
