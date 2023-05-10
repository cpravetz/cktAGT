// This function replaces object references with Id strings to allow saving/deleting
// without circular reference issues.

/**
 * Replaces object references with Id strings to allow saving/deleting without circular reference issues.
 * @param {Object} obj - The object to replace references in.
 * @returns {Object} - The new object with references replaced with Id strings.
 */
function replaceObjectReferencesWithIds(obj) {
  if (obj && typeof(obj) === "object") {
    const newObj = {};
    Object.keys(obj).forEach(key => {
      const value = obj[key];
      if  (typeof(value) !== "object") {
          newObj[key] = value;
      } else  
      if  (value?.id) {
          newObj[`${key}Id`] = value.id;
      } else
      if ((value instanceof Set) || (value instanceof Map)) {
          newObj[key] = replaceObjectReferencesWithIds(value);
      } else
      if (Array.isArray(value)) {
          newObj[key] = value.map(replaceObjectReferencesWithIds);
      } else {
          newObj[key] = replaceObjectReferencesWithIds(value);
      }
    });  
    return newObj;
  } else {
    return obj;
  }
}

module.exports = replaceObjectReferencesWithIds;