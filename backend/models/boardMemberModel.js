const mongoose = require("mongoose");

const boardMemberSchema = new mongoose.Schema(
  {
    boardId: { type: mongoose.Schema.Types.ObjectId, ref: "Board", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, enum: ["admin", "member", "observer"], default: "member" },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

boardMemberSchema.index({ boardId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model("BoardMember", boardMemberSchema);
