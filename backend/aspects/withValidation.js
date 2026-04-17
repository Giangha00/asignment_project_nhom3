function withValidation(validate) {
  return (next) => async (ctx) => {
    if (typeof validate === "function") {
      await validate(ctx);
    }
    return next(ctx);
  };
}

module.exports = { withValidation };
