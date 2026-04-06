const Activity = require("../models/activitiesModel");
const { emitToBoard, emitToWorkspace } = require("./socketEmit");

async function logActivity(app, fields) {
  const doc = await Activity.create(fields);
  const payload = doc.toJSON();
  if (fields.boardId) {
    emitToBoard(app, String(fields.boardId), "activity", payload);
  } else if (fields.workspaceId) {
    emitToWorkspace(app, String(fields.workspaceId), "activity", payload);
  }
  return doc;
}

module.exports = { logActivity };
