const mongoose = require("mongoose");

async function connectMongo() {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/trello_clone";
  mongoose.set("strictQuery", true);

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10_000,
    });
  } catch (err) {
    console.error("\n[MongoDB] Không kết nối được:", err.message);
    console.error("→ Bật MongoDB (local hoặc Atlas) và kiểm tra MONGODB_URI trong .env\n");
    throw err;
  }

  mongoose.connection.on("disconnected", () => {
    console.warn("[MongoDB] Đã ngắt kết nối");
  });

  return mongoose.connection;
}

module.exports = { connectMongo };
