const mongoose = require("mongoose");

const boardSchema = new mongoose.Schema(
  {
    workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace", required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    visibility: { type: String, enum: ["private", "workspace", "public"], default: "workspace" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    coverUrl: { type: String, default: "" },
    isStarred: { type: Boolean, default: false },
    archivedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Board", boardSchema);
