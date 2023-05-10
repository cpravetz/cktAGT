// Copyright 2023 Seakaytee, Inc.
//
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

// This module generates a unique key based on the current date and time, and a random number.

function removeProperty(obj, property) {
    if (obj !== null && typeof obj === 'object') {
      for (const key in obj) {
        if (obj.hasOwnProperty(key) && key === property) {
          delete obj[key];
        } else if (typeof obj[key] === 'object') {
          removeProperty(obj[key], property);
        }
      }
    }
    return obj;
  }
  
  module.exports = removeProperty;