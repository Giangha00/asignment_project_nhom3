const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    cardId: { type: mongoose.Schema.Types.ObjectId, ref: "Card", required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Comment", commentSchema);
