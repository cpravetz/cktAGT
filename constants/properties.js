// Copyright 2023 Seakaytee, Inc.
//
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

// This module generates a unique key based on the current date and time, and a random number.

function removeProperty(obj, property) {
  let newObj;  
  if (obj !== null && obj instanceof Object) {
    newObj = {...obj};
    for (const key in newObj) {
      if (newObj.hasOwnProperty(key) && key === property) {
        delete newObj[key];
/*      } else if (typeof newObj[key] === 'object') {
        newObj[key] = removeProperty(newObj[key], property);*/
      }
    }
  }
  return newObj ?? null;
}
  
  module.exports = removeProperty;