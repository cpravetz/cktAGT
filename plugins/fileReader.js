// Copyright 2023 Seakaytee, Inc.
//
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

// This module provides a class for representing a file reader plugin.

const fs = require("fs");
const Task = require('./../managers/task.js');

class FileReaderPlugin {

  constructor() {
    // The version of the plugin.
    this.version= 1.0;

    // The name of the command.
    this.command= 'ReadFile';

    // The description of the command.
    this.description= 'Reads a file from disk that was previously created by this agent.';

    // The arguments for the command.
    this.args= {
      fileName: 'the name of the file to retrieve',
      url: 'the location of the file, if it is not stored in our local working directory',
    };
  }

  // This method executes the command.
  async execute(agent, command, task) {
    // Get the file path from the task.
    const filePath = (command.args.url || agent.agentManager.workDirName) + command.args.fileName;

    // Check if the file exists.
    if (!fs.existsSync(filePath)) {
      return {
        outcome: 'FAILURE',
        text: `File not found: ${filePath}`,
        results: {
          error: `File not found: ${filePath}`,
        },
      };
    }

    // Read the contents of the file.
    const contents = await fs.readFileSync(filePath);
    const t = new Task(agent,
              'File Send', 'sending the file '+command.args.filename+' to the LLM',
              'this is the file '+command.args.filename, [{name: 'Think', model: agent.model||false, args:{prompt:contents}}],
              {from: this});
    return {
      outcome: 'SUCCESS',
      results: {
        file: contents,
      },
      tasks: [t]
    };
  }

}

module.exports = FileReaderPlugin;
