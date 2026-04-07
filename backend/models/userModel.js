const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const emailCrypto = require("../utils/emailCrypto");

const userSchema = new mongoose.Schema(
  {
    /** Legacy plain email (older documents); new users use emailEncrypted + emailLookup. */
    email: { type: String, lowercase: true, trim: true, sparse: true },
    emailEncrypted: { type: String, sparse: true },
    emailLookup: { type: String, sparse: true, unique: true },
    passwordHash: { type: String, required: true, select: false },
    fullName: { type: String, default: "" },
    avatarUrl: { type: String, default: "" },
    status: { type: String, enum: ["active", "inactive", "suspended"], default: "active" },
    emailVerified: { type: Boolean, default: false },
    /** Wrong password attempts for login; reset on success or password change. */
    failedPasswordAttempts: { type: Number, default: 0 },
    lastLoginAt: { type: Date },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

userSchema.methods.comparePassword = function comparePassword(plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

userSchema.statics.hashPassword = async function hashPassword(plain) {
  return bcrypt.hash(plain, 10);
};

userSchema.statics.buildEmailFields = function buildEmailFields(plain) {
  const norm = emailCrypto.normalizeEmail(plain);
  return {
    emailLookup: emailCrypto.emailLookupHash(norm),
    emailEncrypted: emailCrypto.encryptEmail(norm),
  };
};

userSchema.statics.findByEmailInput = async function findByEmailInput(input, selectFields) {
  const norm = emailCrypto.normalizeEmail(input);
  const lookup = emailCrypto.emailLookupHash(norm);
  let q = this.findOne({ emailLookup: lookup });
  if (selectFields) q = q.select(selectFields);
  let u = await q;
  if (u) return u;
  q = this.findOne({ email: norm });
  if (selectFields) q = q.select(selectFields);
  return q;
};

userSchema.methods.getPlainEmail = function getPlainEmail() {
  if (this.emailEncrypted) {
    try {
      return emailCrypto.decryptEmail(this.emailEncrypted);
    } catch {
      return "";
    }
  }
  return this.email || "";
};

userSchema.set("toJSON", {
  virtuals: true,
  transform(_doc, ret) {
    delete ret.passwordHash;
    if (ret.emailEncrypted) {
      try {
        ret.email = emailCrypto.decryptEmail(ret.emailEncrypted);
      } catch {
        ret.email = "";
      }
      delete ret.emailEncrypted;
    }
    delete ret.emailLookup;
    delete ret.failedPasswordAttempts;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("User", userSchema);
