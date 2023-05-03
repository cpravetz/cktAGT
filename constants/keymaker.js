// Copyright 2023 Seakaytee, Inc.
//
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

// This module generates a unique key based on the current date and time, and a random number.

const uniqid = require('uniqid');

const keyMaker = (prefix) => {
  // Generate the string.
  return uniqid(prefix);
};

module.exports = keyMaker;
