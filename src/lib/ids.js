/** Chuẩn hóa userId từ document API (ObjectId / { _id }) hoặc chuỗi — dùng cho socket & so khớp user hiện tại. */
export function extractUserId(value) {
  if (!value) return "";
  if (typeof value === "object") {
    return String(value._id || value.id || "");
  }
  return String(value);
}

/** So khớp id Mongo/JWT (tránh lệch do hoa thường hoặc kiểu ObjectId). */
export function normalizeUserId(value) {
  return extractUserId(value).trim().toLowerCase();
}

export function idsEqual(a, b) {
  const x = normalizeUserId(a);
  const y = normalizeUserId(b);
  return Boolean(x) && x === y;
}
