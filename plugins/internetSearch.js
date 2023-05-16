// Copyright 2023 Seakaytee, Inc.
//
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

// This module provides a class for representing an internet search plugin.

const Task = require('./../managers/task.js');

class InternetSearchPlugin {

  constructor() {
    // The version of the plugin.
    this.version = 1.0;

    // The name of the command.
  this.command = 'SearchWeb';

  this.description = 'Searches google for a given term';

    // The arguments for the command.
    this.args = {
      find: 'The search term to be used',
    };


  }

  // This method executes the command.
  async execute(agent, command, task) {
    // Create a Google Search API client.
    const {google} = require("googleapis");
    const client = google.customsearch('v1');

    // Search for the term.
    const results = await client.cse.list({
      q: command.args.find,
      cx: process.env.GOOGLE_SEARCH_ENGINE_ID,
      auth:process.env.GOOGLE_API_KEY,
    });

    // Return the results.
    const t = new Task({agent: task.agent,
              name:'File Send', description:'sending the search results to the LLM',
              prompt:'this is the search results for '+command.args.find,
              commands: [{name:'Think', model: task.agent.getModel()|| agent.getModel(), args:{prompt:results}}],
              context:{from: task.id}});
    return {
      outcome: 'SUCCESS',
      results: {
        search: results,
      },
      tasks: [t]
    };
  }
}

module.exports = InternetSearchPlugin;
