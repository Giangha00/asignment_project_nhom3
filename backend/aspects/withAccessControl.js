function withAccessControl(authorize) {
  return (next) => async (ctx) => {
    if (typeof authorize === "function") {
      await authorize(ctx);
    }
    return next(ctx);
  };
}

module.exports = { withAccessControl };
