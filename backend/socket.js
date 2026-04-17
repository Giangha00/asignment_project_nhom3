const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const { AUTH_COOKIE_NAME, getJwtSecret } = require("./middleware/auth");

function readBearerToken(headers) {
  const auth = headers?.authorization || headers?.Authorization || "";
  if (typeof auth !== "string" || !auth.startsWith("Bearer ")) return "";
  return auth.slice(7).trim();
}

function registerSocket(io) {
  io.use((socket, next) => {
    try {
      const raw = socket.handshake.headers.cookie || "";
      const cookies = cookie.parse(raw);
      const tokenFromCookie = cookies[AUTH_COOKIE_NAME];
      const tokenFromAuth =
        socket.handshake.auth && typeof socket.handshake.auth.token === "string"
          ? socket.handshake.auth.token
          : "";
      const tokenFromBearer = readBearerToken(socket.handshake.headers);
      const token = tokenFromCookie || tokenFromAuth || tokenFromBearer || "";
      if (!token) {
        socket.userId = null;
        return next();
      }
      const payload = jwt.verify(token, getJwtSecret());
      socket.userId = String(payload.sub || "").trim().toLowerCase();
      next();
    } catch {
      socket.userId = null;
      next();
    }
  });

  io.on("connection", (socket) => {
    if (socket.userId) {
      socket.join(`user:${socket.userId}`);
    }

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
