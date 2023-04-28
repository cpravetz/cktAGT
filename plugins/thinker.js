// Copyright 2023 Seakaytee, Inc.
//
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

// This module provides a class for representing a thought generator plugin.

const keyMaker = require("../constants/keymaker.js");
const Strings = require("../constants/strings.js");
const Task = require("../managers/task.js");

class ThoughtGeneratorPlugin {

  // The version of the plugin.
  version= 1.0;

  // The name of the command.
  command= 'Think';

  // The description of the plugin.
  description= 'Sends a message to an LLM, likely you';

  // The arguments for the command.
  args= {
    prompt: 'the message to send to the LLM for a response',
    constraints: 'An array of strings describing constraints the LLM should consider',
    commands: 'An array of commands/instructions to be performed by the LLM',
    resources: 'An array of strings or JSON strings with inputs the LLM may need',
    assessments: 'An array of any other text that should be sent to the LLM with the prompt'
  };

  // This method executes the command.
  async execute(agent, command, task) {
    console.log('thinking...');

    // Get the LLM.
    const llm = agent.model();
    if (!llm) {
      console.log('No model was provided to Think');
      return false;
    }

    // Get the follow-up text.
    const followUpText = Strings.pluginIntro + '\n' + agent.pluginManager.describePlugins();

    // Get the command object.
    const commandObject = command;

    // Get the prompt.
    const prompt = command.args.prompt.response || command.args.prompt || command.args.text;

    // Compile the prompt.
    const compiledPrompt = llm.compilePrompt(Strings.thoughtPrefix,
        prompt,
        command.args.constraints || [],
        command.args.commands || [],
        command.args.resources || [],
        command.args.assessments || []);

    // Process the prompt with the LLM.
    const response = await llm.generate(compiledPrompt + followUpText, {
      max_length: 1000,
      temperature: 0.7,
    });

    // Return the response.
    return response;
  }

}


module.exports = ThoughtGeneratorPlugin;
