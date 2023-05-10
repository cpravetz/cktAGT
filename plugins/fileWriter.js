// Copyright 2023 Seakaytee, Inc.
//
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

// This module provides a class for representing a file writer plugin.

const fs = require('fs');
const path = require('path');

class FileWriterPlugin {

    // The version of the plugin.
    static version = 1.0;

    // The name of the command.
    static command = 'WriteFile';

    // The description of the command.
    static description = 'Writes a file to disk to hold interim or final work products as we create them';

    // The arguments for the command.
  static args = {
      fileName: 'the name of the file to retrieve',
      content: 'the content of the file to be saved',
      overwrite: 'boolean true if existing file can be replaced, otherwise false',
    };

  constructor() {  }

  // This method executes the command.
  async execute(agent, command, task) {
    // Get the file path from the task.
    const filePath = path.resolve(agent.agentManager.workDirName, command.args.fileName);

    // Check if the file exists.
    try {
      await fs.promises.access(filePath, fs.constants.F_OK);
      if (!command.args.overwrite) {
        return {
          outcome: 'FAILURE',
          text: `File already exists: ${filePath}`,
          results: {
            error: `File already exists: ${filePath}`,
          },
        };
      }
    } catch (err) {
      return {
        outcome: 'FAILURE',
        text: `Error accessing file: ${filePath}`,
        results: {
          error: err.message,
        },
      };
    }

    // Write the contents of the string to the file.
    try {
      await fs.promises.writeFile(filePath, command.args.content);
      return {
        outcome: 'SUCCESS',
        results: {
          status: 'File written successfully',
        },
      };
    } catch (err) {
      return {
        outcome: 'FAILURE',
        text: `Error writing file: ${filePath}`,
        results: {
          error: err.message,
        },
      };
    }
  }

}

module.exports = FileWriterPlugin;

module.exports = FileWriterPlugin;

module.exports = FileWriterPlugin;