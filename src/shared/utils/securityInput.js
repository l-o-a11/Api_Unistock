const escapeRegex = (value) =>
  String(value).slice(0, 100).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const pickAllowedFields = (source, allowedFields) => {
  const input = source && typeof source === "object" ? source : {};
  const allowed = new Set(allowedFields);
  const result = {};

  for (const [key, value] of Object.entries(input)) {
    if (allowed.has(key)) result[key] = value;
  }

  return result;
};

module.exports = { escapeRegex, pickAllowedFields };
