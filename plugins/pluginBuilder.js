// Copyright 2023 Seakaytee, Inc.
//
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

// This module provides a class for representing a plugin builder plugin.

const fs = require("fs");
const PluginManager = require("../managers/pluginManager.js");
const Strings = require("../constants/strings.js");
const logger = require('./../constants/logger.js');



class PluginBuilderPlugin {

  constructor() {
    // The version of the plugin.
    this.version= 1.0;

    // The name of the command.
    this.command= 'CreatePlugin';
  
    this.description = "Creates a new plugin.  If you don't have a plugin for a function you need but can't accomplish yourself, this plugin will create one.  Describe the function needed in detail in the executeDoes argument.";
  
  
    // The arguments for the command.
    this.args= {
      description: 'The description of the plugin',
      newCommand: 'The name of the new command, must not match any existing command',
      executeDoes: 'An full explanation of what the plugin will do in its execute() function.  Define input arguments and the expected outputs returned by the new plugin.'
    };
  }

  async generatePluginCode(agent, command) {
    const message = Strings.pluginBuilderPrompt.replace(/[t.a.c]/g, command.args.newCommand).replace(/[t.a.d]/g, command.args.description);
    logger({prompt:message},'Requesting plugin code from LLM');
    try {
      const pluginCode = await agent.taskManager.model.generate(message, {
        maxTokens: 1024,
        n: 1
      });
      return pluginCode;
    } catch (err) {
      throw new Error(`Error generating plugin code: ${err}`);
    }
  }

  registerPlugin(filePath) {
    try {
      PluginManager.getInstance().register(filePath);
    } catch (err) {
      output.error = `Error registering plugin: ${err}`;
    }
    return output;
  }

  getFilePath(command) {
    const path = require('path');
    const filePath = path.join('./plugins', `${command}Plugin.js`);
    return filePath;
  }
  
  async writePluginFile(filePath, text, output) {
    try {
      const file = await fs.promises.open(filePath, "w");
      await file.writeFile(text);
      await file.close();
      output.results = {file: filePath, content:text};
    } catch (err) {
      output.outcome = 'FAILURE';
      output.text = `Error saving plugin: ${err}`;
    }
    return output;
  }

  // This method executes the command.
  async execute(agent, command, task) {
    let output = {outcome: 'SUCCESS'};
    try {
        // Get the task description from the task.
      const taskDescription = command.args.description;
      const text = await this.generatePluginCode(agent, command);

      // Create a new file with the name of the task.
      const filePath = this.getFilePath(task.command);
      output = this.writePluginFile(filePath, text, output);
      output = this.registerPlugin(filePath, output);
      logger.debug({output:output},'pluginBuilder: execute results');
    } catch (err) {
        output.outcome = 'FAILURE';
        output.text = `Error creating plugin file: ${err}`;
        output.results = {
            error: output.text,
        }
        logger.error({output: output},`pluginBuilder: execute error ${err.message}`);
    }
    return output;
  }

}

module.exports = PluginBuilderPlugin;
