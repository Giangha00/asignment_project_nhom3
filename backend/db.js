/** Chuẩn hóa URI MongoDB (mặc định DB `trello_boards` nếu URI không có tên DB). */
function withDefaultDb(uri, dbName = "trello_boards") {
  const u = ((uri && uri.trim()) || "mongodb://localhost:27017/").replace(/\s/g, "");
  const m = u.match(/^(mongodb(?:\+srv)?:\/\/[^/?]+)(\/([^?]*))?(\?.*)?$/);
  if (!m) return u;
  const origin = m[1];
  const afterSlash = m[3] !== undefined ? m[3] : "";
  const query = m[4] || "";
  if (afterSlash === "") {
    return `${origin}/${dbName}${query}`;
  }
  return u;
}

module.exports = { withDefaultDb };
