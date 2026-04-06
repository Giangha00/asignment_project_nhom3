function registerSocket(io) {
  io.on("connection", (socket) => {
    socket.on("join:board", (boardId) => {
      if (boardId) socket.join(`board:${boardId}`);
    });
    socket.on("leave:board", (boardId) => {
      if (boardId) socket.leave(`board:${boardId}`);
    });
    socket.on("join:workspace", (workspaceId) => {
      if (workspaceId) socket.join(`workspace:${workspaceId}`);
    });
    socket.on("leave:workspace", (workspaceId) => {
      if (workspaceId) socket.leave(`workspace:${workspaceId}`);
    });
  });
}

module.exports = { registerSocket };
