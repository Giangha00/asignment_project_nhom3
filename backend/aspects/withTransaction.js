const mongoose = require("mongoose");

function withTransaction(options = {}) {
  const { enabled = false } = options;

  return (next) => async (ctx) => {
    if (!enabled) {
      return next(ctx);
    }

    const session = await mongoose.startSession();
    ctx.session = session;
    try {
      let result;
      await session.withTransaction(async () => {
        result = await next(ctx);
      });
      return result;
    } finally {
      ctx.session = null;
      await session.endSession();
    }
  };
}

module.exports = { withTransaction };
