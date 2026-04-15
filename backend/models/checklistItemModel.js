const mongoose = require("mongoose");

const checklistItemSchema = new mongoose.Schema(
  {
    checklistId: { type: mongoose.Schema.Types.ObjectId, ref: "Checklist", required: true, index: true },
    content: { type: String, required: true, trim: true },
    position: { type: Number, default: 0 },
    isCompleted: { type: Boolean, default: false },
    completedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    deletedAt: { type: Date, default: null, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ChecklistItem", checklistItemSchema);
