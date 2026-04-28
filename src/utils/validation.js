function hasRequiredText(value) {
  return typeof value === "string" && Boolean(value.trim());
}

function isStringArray(value) {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isNonNegativeInteger(value) {
  return Number.isInteger(value) && value >= 0;
}

module.exports = {
  hasRequiredText,
  isNonNegativeInteger,
  isStringArray
};
