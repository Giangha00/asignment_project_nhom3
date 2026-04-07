/**
 * At-rest encryption for email (AES-256-GCM) + deterministic lookup (HMAC-SHA256).
 * Set EMAIL_ENCRYPTION_KEY in production: 64 hex chars (32 bytes) or any long secret
 * (hashed to 32 bytes with SHA-256).
 */
const crypto = require("crypto");

const ALGO = "aes-256-gcm";
const IV_LEN = 12;
const TAG_LEN = 16;

function getKey() {
  const raw = process.env.EMAIL_ENCRYPTION_KEY || "";
  if (raw.length >= 64 && /^[0-9a-fA-F]+$/.test(raw)) {
    return Buffer.from(raw, "hex");
  }
  if (raw.length >= 32) {
    return crypto.createHash("sha256").update(raw).digest();
  }
  return crypto.createHash("sha256").update(raw || "dev-only-email-encryption-key").digest();
}

function normalizeEmail(email) {
  return String(email || "").toLowerCase().trim();
}

/** Stable identifier for queries (does not reveal email without the key). */
function emailLookupHash(normalized) {
  return crypto.createHmac("sha256", getKey()).update(normalized).digest("hex");
}

function encryptEmail(plain) {
  const iv = crypto.randomBytes(IV_LEN);
  const cipher = crypto.createCipheriv(ALGO, getKey(), iv);
  const enc = Buffer.concat([cipher.update(String(plain), "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString("base64");
}

function decryptEmail(stored) {
  if (!stored) return "";
  const buf = Buffer.from(stored, "base64");
  const iv = buf.subarray(0, IV_LEN);
  const tag = buf.subarray(IV_LEN, IV_LEN + TAG_LEN);
  const data = buf.subarray(IV_LEN + TAG_LEN);
  const decipher = crypto.createDecipheriv(ALGO, getKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
}

module.exports = {
  normalizeEmail,
  emailLookupHash,
  encryptEmail,
  decryptEmail,
};
