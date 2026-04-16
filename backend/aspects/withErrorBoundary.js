const { HttpError } = require("../utils/httpError");

function withErrorBoundary(options = {}) {
  const { normalizeError } = options;

  return (next) => async (ctx) => {
    try {
      return await next(ctx);
    } catch (error) {
      if (typeof normalizeError === "function") {
        const normalized = await normalizeError(error, ctx);
        if (normalized instanceof Error) {
          throw normalized;
        }
      }

      if (error instanceof HttpError) {
        throw error;
      }

      throw error;
    }
  };
}

module.exports = { withErrorBoundary };
