// Copyright 2023 Seakaytee, Inc.
//
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

// This module provides a class for representing a file writer plugin.

const fs = require("fs");

class FileWriterPlugin {

  constructor() {
    // The version of the plugin.
    this.version= 1.0;

    // The name of the command.
    this.command= 'WriteFile';

    // The description of the command.
    this.description= 'Writes a file to disk to hold interim or final work products as we create them';

    // The arguments for the command.
    this.args= {
      fileName: 'the name of the file to retrieve',
      content: 'the content of the file to be saved',
      overwrite: 'boolean true if existing file can be replaced, otherwise false',
    };
  }

  // This method executes the command.
  async execute(agent, command, task) {
    // Get the file path from the task.
    const filePath = agent.agentManager.workDirName+command.args.fileName;

    // Check if the file exists.
    if (fs.existsSync(filePath) && !command.args.overwrite) {
      return {
        outcome: 'FAILURE',
        text: `File already exists: ${filePath}`,
        results: {
          error: `File already exists: ${filePath}`,
        },
      };
    }

    // Write the contents of the string to the file.
    await fs.writeFileSync(filePath, command.args.content);
    return {
      outcome: 'SUCCESS',
      results: {
        status: 'File written successfully',
      },
    };
  }

}

module.exports = FileWriterPlugin;
