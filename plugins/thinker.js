// Copyright 2023 Seakaytee, Inc.
//
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

// This module provides a class for representing a thought generator plugin.

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

  constructor(agent) {
    // can construct with a
    this.agent = agent || null;
  }

  // This method executes the command.
  async execute(agent, command, task) {
    console.log('thinking...');

    // Get the LLM from the command arguments or use the agent default
    if (command.args.model) {
     const llm = this.agent?.agentManager.modelManager.getModel(command.args.model) || agent.model();
    }

    if (!llm) {
      return {outcome: 'FAILURE', results: {error:'No model was provided to Think'}};
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
    let output = {}

    try {
      // Process the prompt with the LLM.
      const response = await llm.generate(compiledPrompt + followUpText, {
        max_length: 1000,
        temperature: 0.7,
      });
      output.outcome = 'SUCCESS';
      const reply = response.data.choices[0].text || '{\n \"thoughts\": {\n    \"text\": \"Error\"}}';
      let replyJSON = {};
      if (typeof(reply) === String) { replyJSON = JSON.parse(reply); } else { replyJSON = reply }

      output.text = Strings.textify(replyJSON);
      //Create a new think task for each step in the plan
      //We are creating one per command, but could combine all commands for a single action into one task.
      const actions = replyJSON.thoughts.actions;
      const plan = replyJSON.commands;
      for (var i = 0; i < plan.length; i++) {
        let thisStep = plan[i];
        if (thisStep.model) { thisStep.args['model'] = thisStep.model}
        const t = new Task(this.task.agent,
              "Follow up", 'a task created by the model',
              actions[thisStep.action], [{name: thisStep.name, model: thisStep.model||false, args:thisStep.args}],
              {from: this, returned: output}, []);
        output.tasks.push(t);
      }
    }
    catch {error => {
           output.outcome = 'FAILURE';
           output.results = {error: error};
     }
    }
    return output;
  }

}

module.exports = ThoughtGeneratorPlugin;
