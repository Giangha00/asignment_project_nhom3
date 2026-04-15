const mongoose = require("mongoose");

const boardMemberSchema = new mongoose.Schema(
  {
    boardId: { type: mongoose.Schema.Types.ObjectId, ref: "Board", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, enum: ["admin", "member", "observer"], default: "member" },
    deletedAt: { type: Date, default: null, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

boardMemberSchema.index(
  { boardId: 1, userId: 1 },
  { unique: true, partialFilterExpression: { deletedAt: null } }
);

module.exports = mongoose.model("BoardMember", boardMemberSchema);
