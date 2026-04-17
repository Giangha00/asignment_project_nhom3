const { logActivity } = require("../utils/activityLog");

function withAuditLog(options = {}) {
  const { buildActivity } = options;

  return (next) => async (ctx) => {
    const result = await next(ctx);
    if (typeof buildActivity !== "function") {
      return result;
    }

    const activity = await buildActivity(ctx, result);
    if (!activity) {
      return result;
    }

    await logActivity(ctx.app, activity);
    return result;
  };
}

module.exports = { withAuditLog };
