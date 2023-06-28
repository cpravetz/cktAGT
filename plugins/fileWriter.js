// Copyright 2023 Seakaytee, Inc.
//
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

// This module provides a class for representing a file writer plugin.

const fs = require('fs');
const path = require('path');
const logger = require('./../constants/logger.js');

class FileWriterPlugin {


  constructor() {  
    // The version of the plugin.
    this.version = 1.0;

    // The name of the command.
    this.command = 'WriteFile';

    // The description of the command.
    this.description = 'Writes a file to disk to hold interim or final work products as we create them.  Use this to store content off-line instead of in our chat.';

    // The arguments for the command.
    this.args = {
      fileName: 'the name of the file to retrieve',
      content: 'the content of the file to be saved',
      overwrite: 'boolean true if existing file can be replaced, otherwise false'
    };

  }

  // This method executes the command.
  async execute(agent, command, task) {
    // Get the file path from the task.
    const filePath = path.resolve(agent.agentManager.workDirName, command.args.fileName);

    // Check if the file exists.
    try {
      await fs.promises.access(filePath, fs.constants.F_OK);
      if (!command.args.overwrite) {
        const output = {
          outcome: 'FAILURE',
          text: `File already exists: ${filePath}`,
          results: {
            error: `File already exists: ${filePath}`,
          }
        };
        logger.debug({output:output},'fileWriter: file exists');
        return output;
      }
    } catch (err) {
      const output = {
        outcome: 'FAILURE',
        text: `Error accessing file: ${filePath}`,
        results: {
          error: err.message,
        }
      };
      logger.error({output:output},`fileWriter: execute error ${err.message}`);
      return output;
    }

    // Write the contents of the string to the file.
    try {
      await fs.promises.writeFile(filePath, command.args.content);
      const output = {
        outcome: 'SUCCESS',
        results: {
          status: 'File written successfully',
        },
      };
      logger.debug({output:output},'fileWriter: execute result')
      return output;
    } catch (err) {
      const output = {
        outcome: 'FAILURE',
        text: `Error writing file: ${filePath}`,
        results: {
          error: err.message,
        },
      };
      logger.error({output:output},`fileWriter: execute error ${err.message}`);
      return output;
    }
  }

}

module.exports = FileWriterPlugin;
