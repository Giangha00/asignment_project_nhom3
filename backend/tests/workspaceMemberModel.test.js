const test = require("node:test");
const assert = require("node:assert/strict");
const mongoose = require("mongoose");

const WorkspaceMember = require("../models/workSpaceMemberModel");

function objectId() {
  return new mongoose.Types.ObjectId();
}

test("sets lastActive by default when creating a workspace member", () => {
  const doc = new WorkspaceMember({
    workspaceId: objectId(),
    userId: objectId(),
    status: "active",
  });

  assert.ok(doc.lastActive instanceof Date);
  assert.equal(doc.validateSync(), undefined);
});

test("allows null lastActive for legacy compatibility", () => {
  const doc = new WorkspaceMember({
    workspaceId: objectId(),
    userId: objectId(),
    status: "active",
    lastActive: null,
  });

  assert.equal(doc.validateSync(), undefined);
});

test("rejects future lastActive values", () => {
  const future = new Date(Date.now() + 10 * 60 * 1000);
  const doc = new WorkspaceMember({
    workspaceId: objectId(),
    userId: objectId(),
    status: "active",
    lastActive: future,
  });

  const err = doc.validateSync();
  assert.ok(err);
  assert.ok(err.errors.lastActive);
});
