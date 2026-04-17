function composeAspects(coreHandler, aspects = []) {
  return aspects.reduceRight((next, aspect) => aspect(next), coreHandler);
}

module.exports = { composeAspects };
