const mongoose = require("mongoose");

const cardMemberSchema = new mongoose.Schema(
  {
    cardId: { type: mongoose.Schema.Types.ObjectId, ref: "Card", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    assignedAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

cardMemberSchema.index({ cardId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model("CardMember", cardMemberSchema);
