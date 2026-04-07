const mongoose = require("mongoose");

const otpRequestSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    email: { type: String, required: true, lowercase: true, trim: true },
    otpCodeHash: { type: String, required: true },
    otpType: {
      type: String,
      enum: ["verify_email", "reset_password", "change_password"],
      required: true,
    },
    status: { type: String, enum: ["pending", "used", "expired"], default: "pending" },
    attemptCount: { type: Number, default: 0 },
    maxAttempts: { type: Number, default: 5 },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

module.exports = mongoose.model("OtpRequest", otpRequestSchema);
