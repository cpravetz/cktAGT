// Copyright 2023 Seakaytee, Inc.
//
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

const keyMaker = require('./../constants/keyMaker.js');

// This module provides a class for representing tasks.

class Task {

  // This constructor initializes a task.
  constructor(args) {
    this.agent = args.agent;
    this.id = keyMaker();
    this.name = args.name || '';
    this.description = args.description || '';
    this.goal = args.goal || '' ;
    this.context = args.context || "";
    this.dependencies = args.dependencies || [];
    this.status = "pending";
    this.progress = 0;
    this.createdAt = new Date();
    this.updatedAt = this.createdAt;
    this.commands = args.commands;
    this.result = {};
  }


  // This method adds a dependency to the task.
  addDependency(dependency) {
    this.dependencies.push(dependency);
  }

  // This method removes a dependency from the task.
  removeDependency(dependency) {
    this.dependencies.remove(dependency);
  }

  // This method updates the progress of the task.
  updateProgress(progress) {
    this.progress = progress;
  }

  // This method executes the task.
  async execute() {
    // Check if all dependencies are complete.
    for (const dependency of this.dependencies) {
      if (dependency.status !== "complete") {
        this.status = "awaiting dependencies";
        return;
      }
    }

    this.status = "working";
    let responses = [];
    this.result = {};
    // If there is a plugin, execute it.
    for (const command of this.commands) {
      console.log('Calling plugin for '+command.name);
      try {
        const theseResponses = await this.agent.pluginManager.resolveCommand(command, this);
        responses = responses.concat(theseResponses);
      } catch (e) {
        console.log('error in plugins', e);
        this.result.error = e;
      }
    }
    this.result.responses = responses;
    this.updatedAt = new Date();
    return this.result;
  }

  // This method converts the output from the execute function into workproducts and new tasks.
  resolve() {
    // TODO: Implement this method.
  }
}

module.exports = Task;
