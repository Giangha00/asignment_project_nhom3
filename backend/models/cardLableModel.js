const mongoose = require("mongoose");

const cardLabelSchema = new mongoose.Schema(
  {
    cardId: { type: mongoose.Schema.Types.ObjectId, ref: "Card", required: true },
    labelId: { type: mongoose.Schema.Types.ObjectId, ref: "Label", required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

cardLabelSchema.index({ cardId: 1, labelId: 1 }, { unique: true });

module.exports = mongoose.model("CardLabel", cardLabelSchema);
