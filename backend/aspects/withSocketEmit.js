function withSocketEmit(options = {}) {
  const { emit } = options;

  return (next) => async (ctx) => {
    const result = await next(ctx);
    if (typeof emit === "function") {
      await emit(ctx, result);
    }
    return result;
  };
}

module.exports = { withSocketEmit };
