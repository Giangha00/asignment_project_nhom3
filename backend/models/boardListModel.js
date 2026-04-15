const mongoose = require("mongoose");

const boardListSchema = new mongoose.Schema(
  {
    boardId: { type: mongoose.Schema.Types.ObjectId, ref: "Board", required: true, index: true },
    name: { type: String, required: true, trim: true },
    position: { type: Number, default: 0 },
    isArchived: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    archivedAt: { type: Date },
    deletedAt: { type: Date, default: null, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BoardList", boardListSchema);
