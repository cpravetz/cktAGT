// Copyright 2023 Seakaytee, Inc.
//
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

// This module provides a class for representing an HTML reader plugin.

const cheerio = require("cheerio");
const Task = require('./../managers/task.js');

class HTMLReaderPlugin {

  constructor() {
    // The version of the plugin.
    this.version= 1.0;

    // The name of the command.
    this.command= 'ReadHtml';

    this.description = 'Gets the body section of any webpage';

    // The arguments for the command.
    this.args= {
      url: 'The URL of the web page to read',
    };
  }

  // This method executes the command.
  async execute(agent, command, task) {

    const url = command.args.url;

    // Create a new Cheerio instance.
    const cheer = cheerio.load(url);

    // Get the text of the web page.
    const text = cheer("body").text();

    const t = new Task(agent,
              'Html Send', 'sending the html body from file '+command.args.url+' to the LLM',
              'this is the body of '+command.args.url,
              [{name:'Think', model: agent.model||false, args:{prompt:text}}],
              {from: this});
    return {
      outcome: 'SUCCESS',
      results: {
        file: text,
      },
      tasks: [t]
    };

  }

}

module.exports = HTMLReaderPlugin;
