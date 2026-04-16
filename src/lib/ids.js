/** Chuẩn hóa userId từ document API (ObjectId / { _id }) hoặc chuỗi — dùng cho socket & so khớp user hiện tại. */
export function extractUserId(value) {
  if (!value) return "";
  if (typeof value === "object") {
    return String(value._id || value.id || "");
  }
  return String(value);
}
