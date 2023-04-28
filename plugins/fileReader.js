// Copyright 2023 Seakaytee, Inc.
//
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

// This module provides a class for representing a file reader plugin.

const fs = require("fs");

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

  // This method executes the command.
  async execute(agent, command, task) {
    // Get the file path from the task.
    const filePath = (command.args.url || '') + command.args.fileName;

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
    return {
      outcome: 'SUCCESS',
      results: {
        file: contents,
      },
    };
  }

}

module.exports = FileReaderPlugin;
