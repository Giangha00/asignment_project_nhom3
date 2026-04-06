const { HttpError } = require("./httpError");

function asyncHandler(fn) {
  return (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch((err) => {
      if (err instanceof HttpError) {
        return res.status(err.status).json({ error: err.message });
      }
      next(err);
    });
}

module.exports = { asyncHandler };
