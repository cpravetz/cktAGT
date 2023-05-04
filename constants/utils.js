function getDataProperties(obj) {
  const newObj = {};
  for (const key in obj) {
    if (typeof obj[key] !== "object") {
      newObj[key] = obj[key];
    } else {
      //if our object contains a key, store that instead of the object itself
      if (obj[key].id) {
        newObj[key+'Id'] = obj[key].id || false;
      } else {
        //if no key, we need to clean the object before storing it in the newObj
        newObj[key] = getDataProperties(obj[key]);
      }
    }
  }
  return newObj;
}

module.exports = getDataProperties;