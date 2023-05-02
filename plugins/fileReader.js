// Copyright 2023 Seakaytee, Inc.
//
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

// This module provides a class for representing a file reader plugin.

const fs = require("fs");
const Task = require('./../managers/task.js');

class FileReaderPlugin {

  // The version of the plugin.
  version= 1.0;

  // The name of the command.
  command= 'ReadFile';

  // The description of the command.
  description= 'Reads a file from disk';

  // The arguments for the command.
  args= {
    fileName: 'the name of the file to retrieve',
    url: 'the location of the file, if it is not stored in our local working directory',
  };

  constructor() {

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
