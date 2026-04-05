function slugify(text) {
  const s = String(text || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return s.slice(0, 80) || "workspace";
}

module.exports = { slugify };
