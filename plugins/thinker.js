// Copyright 2023 Seakaytee, Inc.
//
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

// This module provides a class for representing a thought generator plugin.

const Task = require("../managers/task.js");
const Strings = require("../constants/strings.js");
const jsonrepair = require('jsonrepair');
const logger = require('./../constants/logger.js');

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
      assessments: 'An array of any other text that should be sent to the LLM with the prompt',
      fullPrompt: 'if true, wraps the prompt in the introductory content'
    };

  }

  async execute(agent, command, task) {

    agent.say('thinking...');
    logger.debug('thinker: executing');
    this.parentTask = task;

    const {args, model} = command;
    const llm = model ? agent.modelManager.getModel(model) : agent.getModel();
    if (!llm) {
        logger.warn({command:command},'thinker: No LLM provided to execute');
        return {outcome: 'FAILURE', results: {error:'No model was provided to Think'}};
    }

    let prompt = this.getPrompt(command);
    let followUpText = '';

    if (command.args.fullPrompt) {
        followUpText = this.getFollowUpText(agent);
        prompt = this.getCompiledPrompt(agent, llm, prompt, args.constraints || [], args.assessments || []);
    }
    logger.debug({prompt:prompt},`thinker: about to process prompt`);
    const output = await this.processPrompt(llm, prompt, followUpText);
    return output;
}

getFollowUpText(agent) {
    return `${Strings.pluginIntro}\n${agent.pluginManager().describePlugins()}`;    
}

getPrompt({args, prompt, text}) {
    const fullPrompt = args ? (args.prompt?.response || args.text || args.prompt) : (prompt || text);
    return fullPrompt;
}

getCompiledPrompt(agent, llm, prompt, constraints, assessments) {
    return `${llm.compilePrompt(Strings.thoughtPrefix, prompt, constraints, assessments)}${Strings.modelListPrompt}${agent.modelManager.ModelNames || llm.getModelName()}`;
}

async processPrompt(llm, compiledPrompt, followUpText) {
    let output = {outcome: 'SUCCESS', tasks: []};
    let reply;
    try {
        reply = await llm.generate([compiledPrompt, followUpText], {max_length: 2000, temperature: Number(process.env.LLM_TEMPERATURE) || 0.7});
        logger.debug({reply: reply, prompt: compiledPrompt},'thinker: LLM reply');
        output = this.processReply(reply, output);
        logger.debug({output: output}, 'thinker: execute results');
    } catch (err) {
        output.outcome = 'FAILURE';
        output.text = err.message;
        output.results = {error: err, reply:(reply ? reply : false)};
        logger.error({output:output},`thinker: execute error ${err.message}`);
    }
    return output;
}

humanizeOutput(replyJSON = {}){
    let humanText = '';
    if (replyJSON.thoughts?.text) {
        humanText = replyJSON.thoughts.text+'\n\nReasons:\n';
        if (typeof(replyJSON.thoughts.reasoning) === 'string') {
            humanText += replyJSON.thoughts.reasoning+'\n';
        }else {
            replyJSON.thoughts.reasoning?.forEach((reason)=> { humanText+= reason+'\n'});
        }
        humanText += '\n\nPlan:\n';
        if (typeof(replyJSON.thoughts.actions) === 'string') {
            humanText += replyJSON.thoughts.actions+'\n';
        }else {
            replyJSON.thoughts.actions?.forEach((stepText)=> { humanText+= stepText+'\n'});
        }
    } else {
        humanText = JSON.stringify(replyJSON);
    }
    return humanText;
}

processReply(reply, output = {outcome: 'SUCCESS', tasks: []}) {
    let replyJSON = {};

    try {
        try {
            if (typeof(reply) === 'string') { replyJSON = JSON.parse(jsonrepair.jsonrepair(reply)); } else { replyJSON = reply };   
            output.text = this.humanizeOutput(replyJSON);
        } catch (err) {
            output.text = reply;
        }
        if (replyJSON.thoughts || replyJSON.commands) {
            const actions = replyJSON.thoughts ? replyJSON.thoughts.actions : (replyJSON.actions  || []);
            const plan = replyJSON.commands || [];
            let idMap = {};
            for (const thisStep of plan) {
                if (thisStep.model) { thisStep.args['model'] = thisStep.model }
                const prompt = thisStep.action ? this.replaceOutput(actions[thisStep.action],idMap)  : thisStep.args.prompt;
                thisStep.args = this.replaceAllOutputs(thisStep.args,idMap);
                const t = this.createTask(thisStep, prompt, idMap);
                logger.debug({task:t},'thinker: task created')
                output.tasks.push(t);
            }
        } else {
            logger.warn({replyJSON:replyJSON},'thinker: need this reply restated');
            output.tasks.push(this.askModelToRephrase(reply));
        }
    } catch (err) {
        output.outcome = 'FAILURE';
        output.text = err.message;
        output.results = {error: err, reply: reply};
        logger.error({output:output},`thinker: Error processing reply ${err.message}`)
    }
    return output;
}

askModelToRephrase(reply) {
    const newPrompt = 'Please restate your reply as '+Strings.defaultResponseFormat+' Your reply was:'+reply;
    return new Task({
        agent: this.parentTask.agent,
        name: "Rephrase",
        description: 'a task created by the model',
        prompt: newPrompt,
        commands: [{name: 'Think', prompt: newPrompt, model: this.parentTask.agent.getModel(), fullPrompt: false}],
        dependencies: [],
        context: {from: this.parentTask.id}
    });
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
    const newObj = {...Obj};
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
    logger.debug({task:t},'thinker: Created Task')
    return t;
}

}

module.exports = ThoughtGeneratorPlugin;
