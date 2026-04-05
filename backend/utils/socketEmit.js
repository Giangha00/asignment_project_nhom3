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

module.exports = { emitToBoard, emitToWorkspace };
