const mongoose = require("mongoose");

const workspaceMemberSchema = new mongoose.Schema(
  {
    workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, enum: ["admin", "member", "guest"], default: "member" },
    status: { type: String, enum: ["active", "invited", "removed"], default: "active" },
    invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    joinedAt: { type: Date },
    lastActive: {
      type: Date,
      default: Date.now,
      index: true,
      validate: {
        validator(value) {
          if (value == null) return true;
          return value.getTime() <= Date.now();
        },
        message: "lastActive cannot be in the future",
      },
    },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

workspaceMemberSchema.index({ workspaceId: 1, userId: 1 }, { unique: true, partialFilterExpression: { deletedAt: null } });
workspaceMemberSchema.index({ workspaceId: 1, lastActive: -1 }, { partialFilterExpression: { deletedAt: null } });

module.exports = mongoose.model("WorkspaceMember", workspaceMemberSchema);
