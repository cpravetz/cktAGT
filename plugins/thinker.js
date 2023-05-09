// Copyright 2023 Seakaytee, Inc.
//
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

// This module provides a class for representing a thought generator plugin.

const Strings = require("../constants/strings.js");
const Task = require("../managers/task.js");

const replaceOutput = function(S, idMap) {
    if ((typeof(S) === 'string')) {
      const regex = /\{output:(\d+)\}/g;
      return S.replace(regex, (_, n) => idMap[n]);
    } else {
        return S
    }
}

const replaceAllOutputs = function(Obj, idMap) {
      const newObj = Obj;
      for (const key in newObj) {
        if (typeof newObj[key] === "string") {
          newObj[key] = replaceOutput(newObj[key], idMap);
        } else if (typeof newObj[key] === "object") {
          newObj[key] = replaceAllOutputs(newObj[key], idMap);
        } else if (Array.isArray(newObj[key])) {
          for (const i = 0; i < newObj[key].length; i++) {
            if (typeof newObj[key][i] === "string") {
              newObj[key][i] = replaceOutput(newObj[key][i], idMap);
            } else if (typeof newObj[key][i] === "object") {
              newObj[key][i] = replaceAllOutputs(newObj[key][i], idMap);
            }
          }
        }
      }
      return newObj;
    }

class ThoughtGeneratorPlugin {

  constructor(agent) {
    this.agent = agent || null;

    // The version of the plugin.
    this.version= 1.0;

    // The name of the command.
    this.command= 'Think';

    // The description of the plugin.
    this.description= 'Sends instructions or information in a message to an LLM, likely you';

    // The arguments for the command.
    this.args= {
      prompt: 'a complete message to send to the LLM that adequately but efficiently explains the goal or item to be resolved',
      constraints: 'An array of strings describing constraints the LLM should consider',
      assessments: 'An array of any other text that should be sent to the LLM with the prompt'
    };
  }



  // This method executes the command.
  async execute(agent, command, task) {
    agent.say('thinking...');

    // Get the LLM from the command arguments or use the agent default
     const llm = task.agent?.agentManager.modelManager.getModel(command.args.model) || agent.model();

    if (!llm) {
      return {outcome: 'FAILURE', results: {error:'No model was provided to Think'}};
    }

    // Get the follow-up text.
    const followUpText = Strings.pluginIntro + '\n' + agent.pluginManager.describePlugins();

    // Get the prompt.
    const prompt = command.args.prompt.response || command.args.prompt || command.args.text;

    // Compile the prompt.
    const compiledPrompt = llm.compilePrompt(Strings.thoughtPrefix,
        prompt,
        command.args.constraints || [],
        command.args.assessments || []);

    let output = {}

    const fullPrompt = [compiledPrompt
                        + Strings.modelListPrompt
                        + agent.agentManager.modelManager.getModelNames(),
                        followUpText];
    task.fullPrompt = fullPrompt;
    try {
      // Process the prompt with the LLM.
      const reply = await llm.generate(fullPrompt , {
        max_length: 2000,
        temperature: Number(process.env.LLM_TEMPERATURE) || 0.7,
      });

      output.outcome = 'SUCCESS';
      let replyJSON = {};
      if (typeof(reply) === 'string') { replyJSON = JSON.parse(reply); } else { replyJSON = reply }

      output.text = Strings.textify(replyJSON);
      //Create a new think task for each step in the plan
      //We are creating one per command, but could combine all commands for a single action into one task.
      const actions = replyJSON.thoughts.actions;
      const plan = replyJSON.commands;
      output.tasks = [];
      let idMap = {};
      // TODO Add logic to make dependencies and reused output use the Task.Id property
      for (const thisStep of plan) {
        if (thisStep.model) { thisStep.args['model'] = thisStep.model }
        const prompt = thisStep.action ? replaceOutput(actions[thisStep.action],idMap)  : thisStep.args.prompt;
        thisStep.args = replaceAllOutputs(thisStep.args,idMap);
        const t = new Task({agent:task.agent,
              name:"Follow up", description:'a task created by the model',
              prompt: prompt || '',
              commands:[{name: replaceOutput(thisStep.name, idMap),
                         model: thisStep.model||false,
                         args: thisStep.args}],
              dependencies: [],
              context:{from: task.id}});
        for(const dependency in thisStep.dependencies) {
            t.dependencies.push(idMap[dependency]);
        };
        // Capture the id of the Task associated with this command
        idMap[thisStep.id] = t.id;
        output.tasks.push(t);
      }
    }
    catch (error) {
           output.outcome = 'FAILURE';
           output.results = {error: error};
     }
    return output;
  }

}

module.exports = ThoughtGeneratorPlugin;
