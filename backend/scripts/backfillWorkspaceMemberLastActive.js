const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", "..", ".env") });

const mongoose = require("mongoose");
const { connectMongo } = require("../config/db");
const { backfillMissingLastActive } = require("../services/workspaceMemberService");

async function run() {
  await connectMongo();
  const modified = await backfillMissingLastActive();
  console.log(`[WorkspaceMember] Backfill completed. Modified: ${modified}`);
  await mongoose.connection.close();
}

run().catch(async (err) => {
  console.error(err);
  await mongoose.connection.close().catch(() => {});
  process.exit(1);
});
