function hasRequiredText(value) {
  return typeof value === "string" && Boolean(value.trim());
}

function isStringArray(value) {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isNonNegativeInteger(value) {
  return Number.isInteger(value) && value >= 0;
}

function isNullableString(value) {
  return value === null || typeof value === "string";
}

function isBoolean(value) {
  return typeof value === "boolean";
}

module.exports = {
  hasRequiredText,
  isBoolean,
  isNonNegativeInteger,
  isNullableString,
  isStringArray
};
