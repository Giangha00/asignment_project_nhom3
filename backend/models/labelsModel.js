const mongoose = require("mongoose");

const labelSchema = new mongoose.Schema(
  {
    boardId: { type: mongoose.Schema.Types.ObjectId, ref: "Board", required: true, index: true },
    name: { type: String, required: true, trim: true },
    color: { type: String, default: "#94a3b8" },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

module.exports = mongoose.model("Label", labelSchema);
