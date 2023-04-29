// Copyright 2023 Seakaytee, Inc.
//
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

// This module provides a class for representing an HTML reader plugin.

const cheerio = require("cheerio");

class HTMLReaderPlugin {

  // The version of the plugin.
  version= 1.0;

  // The name of the command.
  command= 'ReadHtml';

  // The arguments for the command.
  args= {
    url: 'The URL of the web page to read',
  };

  // This method executes the command.
  async execute(agent, command, task) {

    const url = command.args.url;

    // Create a new Cheerio instance.
    const cheer = cheerio.load(url);

    // Get the text of the web page.
    const text = cheer("body").text();

    const t = new Task(this.task.agent, keyMaker(),
              'File Send', 'sending the html body from file '+command.args.filename+' to the LLM',
              'this is the body of '+command.args.filename, [{name:'Think', model: thisStep.model||false, args:{prompt:text}}],
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
