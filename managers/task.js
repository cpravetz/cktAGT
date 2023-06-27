// Copyright 2023 Seakaytee, Inc.
//
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

const keyMaker = require('./../constants/keymaker.js');
const removeProperty = require('./../constants/properties.js');
const logger = require('./../constants/logger.js');
const PluginManager = require("../managers/pluginManager.js");

// Eliminates all instances of a given property from an object and it's object properties

// This module provides a class for representing tasks.
class Task {

  // This constructor initializes a task.
  constructor(args) {
    this.agent = args.agent;
    this.id = keyMaker();
    this.name = args.name || '';
    if (args.prompt) {this.prompt = args.prompt};
    this.description = args.description || '';
    this.goal = args.goal?.response || removeProperty(args.goal || {},'id') ;
    this.context = args.context || "";
    this.dependencies = args.dependencies || [];
    this.status = "pending";
    this.progress = 0;
    this.createdAt = new Date();
    this.updatedAt = this.createdAt;
    this.commands = args.commands ? args.commands.map((c) => { return removeProperty(c, 'id')}) : [];
    this.result = {};
  }

  debugData() {
    return {
      id: this.id,
      name: this.name,
      status: this.status,
      description: this.description,
      agentId: this.agent.id,
      goal: this.goal,
      context: this.context,
      dependencies: this.dependencies,
      createdAt: this.createdAt,
      commands: this.commands,
      result: this.result
    }
  }

  // This method adds a dependency to the task.
  addDependency(dependency) {
    this.dependencies.push(dependency);
  }

  // This method removes a dependency from the task.
  removeDependency(dependency) {
    this.dependencies = this.dependencies.filter(dep => dep !== dependency);
  }

  // This method updates the progress of the task.
  updateProgress(progress) {
    this.progress = progress;
  }

  dependenciesSatisfied() {
    // Check if any of the task's dependencies are not finished
    for (const dependency of this.dependencies) {
      if (this.agent.taskManager.tasks[dependency] && this.agent.taskManager.tasks[dependency].status !== "finished") {
        return false;
      }
    }
    return true;
  }

  // This method executes the task.
  async execute() {
    this.status = "running";
    let responses = [];
    this.result = {};
    // If there is a plugin, execute it.
    for (const command of this.commands) {
      logger.info('Calling plugin for '+command.name);
      try {
        const theseResponses = await PluginManager.getInstance().resolveCommand(command, this);
        responses = responses.concat(theseResponses);
      } catch (err) {
        logger.error({error:err, responses: responses},`Error in plugins ${err.message}`);
        this.result.error = err;
      }
    }
    this.result.responses = responses;
    this.updatedAt = new Date();
    return this.result;
  }

}

module.exports = Task;