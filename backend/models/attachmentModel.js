const mongoose = require("mongoose");

const attachmentSchema = new mongoose.Schema(
  {
    cardId: { type: mongoose.Schema.Types.ObjectId, ref: "Card", required: true, index: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    fileName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    fileMimeType: { type: String, default: "" },
    fileSizeBytes: { type: Number, default: 0 },
    deletedAt: { type: Date, default: null, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

module.exports = mongoose.model("Attachment", attachmentSchema);
