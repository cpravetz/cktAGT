// Copyright 2023 Seakaytee, Inc.
//
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

// This module provides a class for representing tasks.

class Task {

  // This constructor initializes a task.
  constructor(agent, id, name, description, goal, commands, context, dependencies) {
    this.agent = agent;
    this.id = id;
    this.name = name;
    this.goal = goal;
    this.context = context || "";
    this.dependencies = dependencies || [];
    this.status = "pending";
    this.progress = 0;
    this.createdAt = new Date();
    this.updatedAt = this.createdAt;
    this.commands = commands;
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
    // If there is a plugin, execute it.
    for (const command of this.commands) {
      console.log('Calling plugin for '+command.name);
      try {
        const theseResponses = await this.agent.pluginManager.resolveCommand(command, this);
        responses.push(theseResponses);
      } catch (e) {
        console.log('error in plugins', e);
      }
    }
    this.result = responses;
    this.updatedAt = new Date();
    return responses;
  }

  // This method converts the output from the execute function into workproducts and new tasks.
  resolve() {
    // TODO: Implement this method.
  }
}

module.exports = Task;
