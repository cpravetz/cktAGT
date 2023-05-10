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
  
    this.description = "Creates new plugins.  If you don't have a plugin for a feature you need, this plugin will create one by asking the model you identify to generate code.";
  
  
    // The arguments for the command.
    this.args= {
      description: 'The description of the plugin',
      newCommand: 'The name of the new command',
      executeDoes: 'An explanation of the expected output of the execute() function of the new plugin'
    };
  
  
  }

  // This method executes the command.
  async execute(agent, command, task) {
    // Get the task description from the task.
    const taskDescription = command.args.description;

    // Get the user's input for the plugin code.
    const messages = [{
      role: "user",
      prompt: Strings.pluginBuilderPrompt.replaceAll('[t.a.c]', commands.args.command).replaceAll('[t.a.d]', command.args.description),
    }];
    const text = await agent.taskManager.model.generate(messages, {
      maxTokens: 1024,
      n: 1
    });

    // Create a new file with the name of the task.
    const filePath = `./plugins/${task.command}+'Plugin'.js`;
    try {
      const file = await fs.promises.open(filePath, "w");
      await file.writeFile(text);
      await file.close();
      pluginManager.register(filePath);
    } catch (err) {
      console.error(`Error writing plugin file: ${err}`);
    }
  }

}

module.exports = PluginBuilderPlugin;

module.exports = PluginBuilderPlugin;