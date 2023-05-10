// This function replaces object references with Id strings to allow saving/deleting
// without circular reference issues.

/**
 * Replaces object references with Id strings to allow saving/deleting without circular reference issues.
 * @param {Object} obj - The object to replace references in.
 * @returns {Object} - The new object with references replaced with Id strings.
 */
function replaceObjectReferencesWithIds(obj) {
  const newObj = {};
  for (const [key, value] of Object.entries(obj)) {
    switch (true) {
      case typeof value !== "object":
        newObj[key] = value;
        break;
      case value instanceof Set || value instanceof Map:
        newObj[key] = replaceObjectReferencesWithIds(value);
        break;
      case Array.isArray(value):
        newObj[key] = value.map(replaceObjectReferencesWithIds);
        break;  
      case value?.id:
        newObj[`${key}Id`] = value.id;
        break;
      default:
        newObj[key] = replaceObjectReferencesWithIds(value);
    }
  }
  return newObj;
}

module.exports = replaceObjectReferencesWithIds;