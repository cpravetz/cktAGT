// Copyright 2023 Seakaytee, Inc.
//
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

// This module provides a class for representing a thought generator plugin.

const Strings = require("../constants/strings.js");
const Task = require("../managers/task.js");

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
      prompt: 'the message to send to the LLM for a response',
      constraints: 'An array of strings describing constraints the LLM should consider',
      resources: 'An array of strings or JSON strings with inputs the LLM may need',
      assessments: 'An array of any other text that should be sent to the LLM with the prompt'
    };
  }



  // This method executes the command.
  async execute(agent, command, task) {

    function replaceOutput(S, idMap) {
      const regex = /\{output:(\d+)\}/g;
      return S.replace(regex, (_, n) => idMap[n]);
    }

    function replaceAllOutputs(Obj, idMap) {
      for (const key in Obj) {
        if (typeof Obj[key] === "string") {
          Obj[key] = replaceOutput(Obj[key], idMap);
        } else if (typeof Obj[key] === "object") {
          replaceAllOutputs(Obj[key], idMap);
        } else if (Array.isArray(Obj[key])) {
          for (const i = 0; i < Obj[key].length; i++) {
            if (typeof Obj[key][i] === "string") {
              Obj[key][i] = replaceOutput(Obj[key][i], idMap);
            } else if (typeof Obj[key][i] === "object") {
              replaceAllOutputs(Obj[key][i], idMap);
            }
          }
        }
      }
    }

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
        command.args.resources || [],
        command.args.assessments || []);

    let output = {}

    const fullPrompt = compiledPrompt
                        + Strings.modelListPrompt
                        + agent.agentManager.modelManager.getModelNames()
                        + followUpText;
    try {
      // Process the prompt with the LLM.
      const response = await llm.generate(fullPrompt , {
        max_length: 1000,
        temperature: 0.7,
      });

      output.outcome = 'SUCCESS';
      const reply = response.data.choices[0].text || '{\n "thoughts": {\n    "text": "Error"}}';
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
        const t = new Task({agent:task.agent,
              name:"Follow up", description:'a task created by the model',
              prompt:replaceOutput(actions[thisStep.action],idMap),
              commands:[{name: replaceOutput(thisStep.name),
              model: thisStep.model||false,
              args:replaceAllOutputs(thisStep.args,idMap)}],
              dependencies: [],
              context:{from: this.id}});
        for(const dependency in thisStep.dependencies) {
            t.dependencies.push(idMap[dependency]);
        };
        // Capture the id of the Task associated with this command
        idMap[thisStep.id] = t.id;
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
