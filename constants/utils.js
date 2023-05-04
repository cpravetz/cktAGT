function getDataProperties(obj) {
  const newObj = {};
  for (const key in obj) {
    if (typeof obj[key] !== "object") {
      newObj[key] = obj[key];
    } else {
        if (obj[key].id) {
            newObj[key+'Id'] = obj[key].id;
        }
    }
  }
  return newObj;
}

module.exports = getDataProperties;