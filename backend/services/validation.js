const mongoose = require("mongoose");
const { HttpError } = require("../utils/httpError");

function assertObjectId(id, message = "Invalid id") {
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    throw new HttpError(400, message);
  }
}

module.exports = { assertObjectId };
