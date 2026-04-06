const mongoose = require("mongoose");

const workspaceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, lowercase: true },
    description: { type: String, default: "" },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    visibility: { type: String, enum: ["private", "workspace", "public"], default: "private" },
    logoUrl: { type: String, default: "" },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

workspaceSchema.index({ slug: 1 }, { unique: true, partialFilterExpression: { deletedAt: null } });

module.exports = mongoose.model("Workspace", workspaceSchema);
