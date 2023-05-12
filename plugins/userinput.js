// Copyright 2023 Seakaytee, Inc.
//
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

// This module provides a class for representing a user input plugin.

class UserInputPlugin  {


  constructor() {
    // The version of the plugin.
    this.version= 1.0;

    // The name of the command.
    this.command= 'AskUser';

    this.description = 'Gets input back from the system user';

    // The arguments for the command.
    this.args= {
      prompt: 'the message to send to the user',
      choices: 'An array of strings with possible answers',
      required: 'A boolean indicating whether the user is required to answer'
    };

  }

  // This method executes the command.
  async execute(agent, command, task) {
    // Get the prompt.
    const prompt = command.args.prompt;

    // Get the choices.
    const choices = command.args.choices || [];

    // Get the required flag.
    const required = command.args.required || false;

    // Ask the user for input.
    const response = await agent.agentManager.ask(prompt, choices, required);

    // Return the response.
    return response;
  }

}

module.exports = UserInputPlugin;
