// Copyright 2023 Seakaytee, Inc.
//
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

// This module provides a class for launching new agents.

const Agent = require('./../managers/agent.js');
const Task = require('./../managers/task.js');
const google = require('googlethis');
const logger = require('./../constants/logger.js');


class SubAgentPlugin {

  constructor() {
    // The version of the plugin.
    this.version = 1.0;

    // The name of the command.
    this.command = 'SubAgent';

    this.description = 'Creates a new agent with a new goal.  Use this to section off parts of your plan so they can receive focus.';

    // The arguments for the command.
    this.args = {
      description: 'A description of the agent',
      goal: 'An explanation of the goal or purpose of the agent.  It should be an outcome needed as part of reaching yur goal.',
      commands: 'An array of commands for the first task of the new agent.  Defined using the same json your using now to define commands.',
      model: 'The initial LLM model to use as the primary by the new agent'
    };


  }

  // This method executes the command.
  async execute(agent, command, task) {
    const output = {outcome:'SUCCESS'};
    try {
      const subAgent = new Agent(agent.agentManager, `Sub agent for ${agent.id}`);
      const commands = command.args.commands || [{name: "Think", args: {prompt: command.args.goal, fullPrompt: true}}];
      const task = new Task({agent:subAgent, name:"Initial Task",
        description:command.args.description, goal:command.args.goal, commands:command.args.description});
      agent.agentManager.addSubAgent(subAgent, task, true)
    } catch (err) {
      output.outcome = 'FAILURE',
      output.text = err.message,
      output.results = {error: err}
      logger.error({output:output},`subAgent: execute error ${err.message}`);
    }
  return output;
  }            

    
/*    // Create a Google Search API client.
    const {google} = require("googleapis");
    const client = google.customsearch('v1');

    // Search for the term.
    const results = await client.cse.list({
      q: command.args.find,
      cx: process.env.GOOGLE_SEARCH_ENGINE_ID,
      auth:process.env.GOOGLE_API_KEY,
    });
    
    // Return the results.
    const t = new Task({agent: task.agent,
              name:'File Send', description:'sending the search results to the LLM',
              prompt:'this is the search results for '+command.args.find,
              commands: [{name:'Think', model: task.agent.getModel()|| agent.getModel(), args:{prompt:results}}],
              context:{from: task.id}});
    return {
      outcome: 'SUCCESS',
      results: {
        search: results,
      },
      tasks: [t]
    };
  }*/
}

module.exports = subAgentPlugin;
