/**
 * Chỉ khởi động kết nối: MongoDB → HTTP (Express) + Socket.io cùng cổng.
 * Route & logic API: app.js — sự kiện socket: socket.js
 */
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const http = require("http");
const mongoose = require("mongoose");
const { Server } = require("socket.io");
const { connectMongo } = require("./config/db");
const { createApp } = require("./app");
const { registerSocket } = require("./socket");

/** Mặc định 4000 để tránh trùng PORT=3000 của react-scripts khi chạy `npm run dev`. */
const PORT = Number(process.env.API_PORT) || 4000;

async function main() {
  await connectMongo();

  const app = createApp();
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: { origin: true, credentials: true },
  });
  app.set("io", io);
  registerSocket(io);

  server.listen(PORT, () => {
    const base = `http://localhost:${PORT}`;
    console.log("");
    console.log(`  API + Socket.io  ${base}`);
    console.log(`  Health check     ${base}/api/health`);
    console.log(`  Chỉ backend — không cần React; gọi API bằng Postman/curl.`);
    console.log("");
  });

  async function shutdown() {
    console.log("\nĐang tắt server…");
    await mongoose.connection.close().catch(() => {});
    await new Promise((resolve) => {
      server.close(() => resolve());
    });
    process.exit(0);
  }
  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
