// Copyright 2023 Seakaytee, Inc.
//
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

// This module provides a class for representing a file reader plugin.

const fs = require("fs");
const Task = require('./../managers/task.js');
const path = require('path');

class FileReaderPlugin {

  constructor() {
    this.version = 1.0;
    this.command = 'ReadFile';
    this.description = 'Reads a file from disk that was previously created by this agent.';
    this.args = {
      fileName: 'the name of the file to retrieve',
      url: 'the location of the file, if it is not stored in our local working directory',
      sendToLLM: 'if true, generates a new task to send the file content to you or another LLM'
    };
  
  }

  async execute(agent, command, task) {
    const fileName = command.args.fileName;
    const url = command.args.url || agent.agentManager.workDirName;
    if (path.isAbsolute(fileName) || path.isAbsolute(url) || fileName.includes('..') || url.includes('..')) {
      throw new Error('Invalid file name or URL');
    }
    const filePath = path.join(url, fileName);

    if (!fs.existsSync(filePath)) {
      return {
        outcome: 'FAILURE',
        text: `File not found: ${filePath}`,
        results: {
          error: `File not found: ${filePath}`,
        },
      };
    }

    const contents = await this.readFile(filePath);
    const tasks = [];
    if (command.args.sendToLLM) {
      tasks.push( this.createTask(agent, fileName, contents));
    }

    return {
      outcome: 'SUCCESS',
      results: {
        file: contents,
      },
      tasks: tasks
    };
  }

  async readFile(filePath) {
    return fs.promises.readFile(filePath);
  }

  createTask(agent, fileName, contents) {
    return new Task({
      agent: agent,
      name: 'File Send',
      description: 'sending the file ' + fileName + ' to the LLM',
      prompt: 'this is the file ' + fileName,
      commands: [{name: 'Think', model: agent.model || false, args: {prompt: contents}}],
      context: {from: this.id}
    });
  }
}

module.exports = FileReaderPlugin;

module.exports = FileReaderPlugin;