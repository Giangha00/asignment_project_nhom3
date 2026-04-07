class HttpError extends Error {
  constructor(status, message, extras = null) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    /** Extra fields merged into JSON responses (e.g. suggestPasswordChange). */
    this.extras = extras;
  }
}

function jsonBodyForHttpError(err) {
  const body = { error: err.message };
  if (err.extras && typeof err.extras === "object") {
    Object.assign(body, err.extras);
  }
  return body;
}

module.exports = { HttpError, jsonBodyForHttpError };
