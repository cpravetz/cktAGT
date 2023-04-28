// Copyright 2023 Seakaytee, Inc.
//
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

// This module generates a unique key based on the current date and time, and a random number.

const keyMaker = () => {
  // Get the current date and time.
  const now = new Date();

  // Generate the string.
  return `${now.toISOString()}-${Math.floor(Math.random() * 1000)}`;
};

module.exports = keyMaker;
