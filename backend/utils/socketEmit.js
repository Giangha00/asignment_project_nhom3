function emitToBoard(app, boardId, event, payload) {
  if (!boardId) return;
  const io = app.get("io");
  if (io) io.to(`board:${boardId}`).emit(event, payload);
}

function emitToWorkspace(app, workspaceId, event, payload) {
  if (!workspaceId) return;
  const io = app.get("io");
  if (io) io.to(`workspace:${workspaceId}`).emit(event, payload);
}

/** Gửi tới mọi tab đang mở của user (phòng `user:{userId}`) — khớp chuẩn hóa với socket.join. */
function emitToUser(app, userId, event, payload) {
  if (!userId) return;
  const io = app.get("io");
  if (!io) return;
  const rid = String(userId).trim().toLowerCase();
  io.to(`user:${rid}`).emit(event, payload);
}

module.exports = { emitToBoard, emitToWorkspace, emitToUser };
