const mongoose = require("mongoose");

const checklistSchema = new mongoose.Schema(
  {
    cardId: { type: mongoose.Schema.Types.ObjectId, ref: "Card", required: true, index: true },
    title: { type: String, required: true, trim: true },
    position: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Checklist", checklistSchema);
