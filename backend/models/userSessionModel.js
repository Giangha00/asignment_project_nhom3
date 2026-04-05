const mongoose = require("mongoose");

const userSessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    refreshTokenHash: { type: String, required: true },
    userAgent: { type: String, default: "" },
    ipAddress: { type: String, default: "" },
    isRevoked: { type: Boolean, default: false },
    expiresAt: { type: Date, required: true },
    revokedAt: { type: Date },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

module.exports = mongoose.model("UserSession", userSessionSchema);
