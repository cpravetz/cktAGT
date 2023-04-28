// Copyright 2023 Seakaytee, Inc.
//
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

// This module provides a class for representing an internet search plugin.

const google = require("googleapis");

class InternetSearchPlugin {

  // The version of the plugin.
  version= 1.0;

  // The name of the command.
  command= 'SearchWeb';

  // The arguments for the command.
  args= {
    find: 'The search term to be used',
  };

  // This method executes the command.
  async execute(agent, command, task) {
    // Create a Google Search API client.
    const client = new google.customsearch({
      version: "v1",
      key: process.env.GOOGLE_API_KEY,
      cx: process.env.GOOGLE_SEARCH_ENGINE_ID,
    });

    // Search for the term.
    const results = await client.cse.list({
      q: command.args.find,
    });

    // Return the results.
    return results;
  }
}

module.exports = InternetSearchPlugin;
