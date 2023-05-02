// Copyright 2023 Seakaytee, Inc.
//
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

// This module provides a class for representing a plugin builder plugin.

const fs = require("fs");
const pluginManager = require("../managers/pluginManager.js");
const Strings = require("../constants/strings.js");

class PluginBuilderPlugin {

  constructor() {
    // The version of the plugin.
    this.version= 1.0;

    // The name of the command.
    this.command= 'CreatePlugin';

    this.description = "Creates new plugins.  If you don't have a plugin for a feature you need, this plugin will create one";


    // The arguments for the command.
    this.args= {
      description: 'The description of the plugin',
      newCommand: 'The name of the new command',
    };
 }

  // This method executes the command.
  async execute(agent, command, task) {
    // Get the task description from the task.
    const taskDescription = command.args.description;

    const taskCommand = command.args.newCommand;

    // Get the user's input for the plugin code.
    const messages = [{
      role: "user",
      prompt: `Create a JavaScript function that ${taskDescription}.`
    }, {
      role: "user",
      prompt: Strings.pluginBuilderPrompt
    }];
    const completions = await agent.taskManager.model.generate(messages, {
      maxTokens: 1024,
      n: 1
    });
    const text = completions.choices[0];

    // Create a new file with the name of the task.
    const filePath = `./plugins/${task.command}+'Plugin'.js`;
    const file = fs.openSync(filePath, "w");

    // Write the plugin code to the file.
    file.write(text);
    file.close();

    // Register the plugin with the plugin manager.
    pluginManager.register(filePath);
  }

}

module.exports = PluginBuilderPlugin;
