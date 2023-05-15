// Copyright 2023 Seakaytee, Inc.
//
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

// This module provides a class for representing a thought generator plugin.

const Task = require("../managers/task.js");
const Strings = require("../constants/strings.js");
const jsonrepair = require('jsonrepair');

class ThoughtGeneratorPlugin {
  
  constructor() {

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

  async execute(agent, command, task) {

    agent.say('thinking...');

    this.parentTask = task;

    const llm = this.getLLM(agent, command, task);
    if (!llm) {
        return {outcome: 'FAILURE', results: {error:'No model was provided to Think'}};
    }

    const followUpText = this.getFollowUpText(agent);
    const prompt = this.getPrompt(command);
    const compiledPrompt = this.getCompiledPrompt(agent, llm, prompt, command.args.constraints || [], command.args.assessments || []);
    const output = await this.processPrompt(llm, compiledPrompt, followUpText);
    return output;
}

getLLM(agent, command, task) {
    const llm = task.agent?.modelManager().getModel(command.args.model) || agent.getModel();
    return llm;
}

getFollowUpText(agent) {
    const followUpText = Strings.pluginIntro + '\n' + agent.pluginManager.describePlugins();
    return followUpText;
}

getPrompt(command) {
    const prompt = command.args.prompt.response || command.args.prompt || command.args.text;
    return prompt;
}

getCompiledPrompt(agent, llm, prompt, constraints, assessments) {
    const compiledPrompt = llm.compilePrompt(Strings.thoughtPrefix, prompt, constraints, assessments)+ Strings.modelListPrompt + (agent.modelManager().ModelNames|| agent.getModel().getModelName());
    return compiledPrompt;
}

async processPrompt(llm, compiledPrompt, followUpText) {
    let output = {outcome: 'SUCCESS', tasks: []};
    try {
        const reply = await llm.generate([compiledPrompt, followUpText], {max_length: 2000, temperature: Number(process.env.LLM_TEMPERATURE) || 0.7});
        output = this.processReply(reply);
    } catch (error) {
        output.outcome = 'FAILURE';
        output.results = {error: error};
    }
    return output;
}

processReply(reply) {
    let output = {outcome: 'SUCCESS', tasks: []};
    let replyJSON = {};

    if (typeof(reply) === 'string') { replyJSON = JSON.parse(jsonrepair.jsonrepair(reply)); } else { replyJSON = reply }
    output.text = replyJSON.thoughts ? Strings.textify(replyJSON) : JSON.stringify(replyJSON);

    const actions = replyJSON.thoughts ? replyJSON.thoughts.actions : (replyJSON.actions  || []);
    const plan = replyJSON.commands || [];
    let idMap = {};
    for (const thisStep of plan) {
        if (thisStep.model) { thisStep.args['model'] = thisStep.model }
        const prompt = thisStep.action ? this.replaceOutput(actions[thisStep.action],idMap)  : thisStep.args.prompt;
        thisStep.args = this.replaceAllOutputs(thisStep.args,idMap);
        const t = this.createTask(thisStep, prompt, idMap);
        output.tasks.push(t);
    }
    return output;
}

replaceOutput(S, idMap) {
    if ((typeof(S) === 'string')) {
        const regex = /\{output:(\d+)\}/g;
        return S.replace(regex, (_, n) => idMap[n]);
    } else {
        return S
    }
}

replaceAllOutputs(Obj, idMap) {
    const newObj = Obj;
    for (const key in newObj) {
        if (typeof newObj[key] === "string") {
            newObj[key] = this.replaceOutput(newObj[key], idMap);
        } else if (typeof newObj[key] === "object") {
            newObj[key] = this.replaceAllOutputs(newObj[key], idMap);
        } else if (Array.isArray(newObj[key])) {
            for (let i = 0; i < newObj[key].length; i++) {
                if (typeof newObj[key][i] === "string") {
                    newObj[key][i] = this.replaceOutput(newObj[key][i], idMap);
                } else if (typeof newObj[key][i] === "object") {
                    newObj[key][i] = this.replaceAllOutputs(newObj[key][i], idMap);
                }
            }
        }
    }
    return newObj;
}

createTask(thisStep, prompt, idMap) {
    const t = new Task({
        agent: this.parentTask.agent,
        name: "Follow up",
        description: 'a task created by the model',
        prompt: prompt || '',
        commands: [{name: this.replaceOutput(thisStep.name, idMap), model: thisStep.model || false, args: thisStep.args}],
        dependencies: [],
        context: {from: this.parentTask.id}
    });
    for (const dependency in thisStep.dependencies) {
        t.dependencies.push(idMap[dependency]);
    };
    idMap[thisStep.id] = t.id;
    return t;
}


}

module.exports = ThoughtGeneratorPlugin;
