const { HttpError, jsonBodyForHttpError } = require("./httpError");

function asyncHandler(fn) {
  return (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch((err) => {
      if (err instanceof HttpError) {
        return res.status(err.status).json(jsonBodyForHttpError(err));
      }
      next(err);
    });
}

module.exports = { asyncHandler };
