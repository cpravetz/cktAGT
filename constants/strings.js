// Copyright 2023 Seakaytee, Inc.
//
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

// This module contains strings that are used by the agent manager.

const Strings = {
  // A message that is displayed when the agent manager is ready.
  welcome: 'Your agent manager is now ready. Do you want to start a new agent or continue with an existing agent?',
  restartAgent: 'Restart an existing agent',
  startNewAgent: 'Start a new agent with a new goal',
  newAgentMsg:'Begin by providing a set of instructions for the agent to tackle. Begin with a goal, then add any constraints or parameters that might apply. Remember that this is experimental software and could waste your time and your money.',

  // A message that is displayed when the agent is asked for its goal.
  goalPrompt: "What is your goal?",

  // A message that is displayed when the agent is considering a goal.
  thoughtPrefix: 'Consider the following goal. If it is immediately resolvable, do so. Otherwise, develop a plan of the steps needed to reach the goal. Use or create plugins for functions that should be completed on my side, or recommend an alternative LLM to use for any activities that would be better performed elsewhere in order to meet the constraints of our primary goal.',

  // A message that is displayed when the agent is considering a task.
  subThoughtPrefix: 'Continuing to work towards our goal, consider the following task. If it is immediately resolvable, do so. Otherwise, develop a plan of the steps needed to complete the task and ultimately reach the goal.',

  // A message that is displayed when the agent is asked to wrap a function in a class template.
  pluginBuilderPrompt: `
Wrap this function in the following class template:

`+'  class ${taskCommand}Plugin {'+`
  version: "1.0";
`+'  command: "${taskCommand}";'+`
  description: "A description of the plugin";
  args: a JSON object with key/value pairs for each input as name: description
  constructor() { // constructor goes here
  }

  execute(agent, command, task) {
    // New function goes here
  }
}

The plugin should return the following object from the execute function:

{
  outcome: either "SUCCESS" or "FAILURE",
  command: the command object passed to the function,
  task: the associated task passed to the function,
  text: a string to show the human user via the say() function in the agent,
  results: {an object with command specific results, for failures will have error: with an error message},
  tasks: [an array of new tasks to be launched]
}
`,

  // The default model that is used by the agent.
  defaultModel: "GPT35",

  // The default response format that is used by the agent.
  defaultResponseFormat: `
Return your response in JSON format as described here:

{
  "thoughts": {
    "text": "thought",
    "reasoning": reasoning behind your response,
    "actions": a numbered list of items in the long-term plan,
    "models": recommendations for other LLMs to carry out any of the actions,
  },
  "commands": [
    {
      "id": a sequential number to identify this command from others,
      "name": the name of the command, taken from the associated plugin (eg: Think, ReadFile),
      "action": the number of the action above which this command stems from,
      "args": an array of arguments to pass the executing task in the form {"arg name": "value",...},
      "model": if this is a Think, the LLM best suited to execute the command accurately and cost efficiently
    }
  ]
}
`,
  // A function that formats a response from the agent.
  textify: (obj) => {
    let text = 'The agent responds: '
      + '\n\t' + obj.thoughts.text || '';
    if (obj.thoughts.reasoning) {
      text += '\n\n\tReasoning:\n\t\t' + obj.thoughts.reasoning;
    }
    if (obj.thoughts.criticism) {
      text += '\n\n\tCriticism:\n\t\t' + obj.thoughts.criticism;
    }
    if (obj.thoughts.actions) {
      text += '\n\n\tActions:';
      for (var i = 0; i < obj.thoughts.actions.length; i++) {
        text += '\n\t\t' + obj.thoughts.actions[i];
      }
    }
    if (obj.commands) {
      text += '\n\n\tCommands:';
      for (var i = 0; i < obj.commands.length; i++) {
        const cmd = obj.commands[i];
        text += '\n\t\t' + cmd.name;
        if (cmd.model) {
          text += '\n\t\t\tModel: ' + cmd.model;
        }
        text += '\n\t\t\tArguments:\n';
        for (var j = 0; j < cmd.args; j++) {
          text += '\t\t\t\t' + JSON.stringify(cmd.args[j]) + '\n';
        }
      }
    }
    return text.trim().replace(/\\t/g, "\t").replace(/\\n/g, "\n");
  }
};

module.exports = Strings;
