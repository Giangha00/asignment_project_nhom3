const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", "..", ".env") });

const mongoose = require("mongoose");
const { connectMongo } = require("../config/db");
const Board = require("../models/boardModel");
const BoardList = require("../models/boardListModel");
const Card = require("../models/cardModel");
const ChecklistItem = require("../models/checklistItemModel");
const Attachment = require("../models/attachmentModel");
const BoardMember = require("../models/boardMemberModel");
const CardMember = require("../models/cardMemberModel");

async function backfillDeletedAt() {
  const models = [
    ["Board", Board],
    ["BoardList", BoardList],
    ["Card", Card],
    ["ChecklistItem", ChecklistItem],
    ["Attachment", Attachment],
    ["BoardMember", BoardMember],
    ["CardMember", CardMember],
  ];

  const results = [];
  for (const [name, model] of models) {
    const result = await model.updateMany(
      { deletedAt: { $exists: false } },
      { $set: { deletedAt: null } }
    );
    results.push({ name, modifiedCount: result.modifiedCount || 0 });
  }
  return results;
}

async function run() {
  await connectMongo();
  const results = await backfillDeletedAt();
  for (const row of results) {
    console.log(`[SoftDelete] ${row.name} updated: ${row.modifiedCount}`);
  }
  await mongoose.connection.close();
}

run().catch(async (err) => {
  console.error(err);
  await mongoose.connection.close().catch(() => {});
  process.exit(1);
});
