// Copyright 2023 Seakaytee, Inc.
//
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

// This module provides a class for representing an HTML reader plugin.

const cheerio = require("cheerio");
const Task = require('./../managers/task.js');

class HTMLReaderPlugin {

    // The version of the plugin.
  static version = 1.0;

    // The name of the command.
  static command = 'ReadHtml';

  static description = 'Gets the body section of any webpage';

    // The arguments for the command.
  static args = {
      url: 'The URL of the web page to read',
      sendToLLM: 'if true, generates a new task to send the file content to you or another LLM'
    };

  constructor() {  }

  // This method executes the command.
  async execute(agent, command, task) {

    const url = command.args.url;

    // Create a new Cheerio instance.
    const cheer = cheerio.load(url);

    // Get the text of the web page.
    const text = cheer("body").text();

    const tasks = [];
    if (command.args.sendToLLM) {
      tasks.push( new Task({agent:agent,
              name:'Html Send', description:'sending the html body from file '+command.args.url+' to the LLM',
              prompt:'this is the body of '+command.args.url,
              commands:[{name:'Think', model: agent.model||false, args:{prompt:text}}],
              context:{from: this.id}}));
    }              
    
    return {
      outcome: 'SUCCESS',
      results: {
        file: text,
      },
      tasks: tasks
    };

  }

}

module.exports = HTMLReaderPlugin;
