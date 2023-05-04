// Copyright 2023 Seakaytee, Inc.
//
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

const keyMaker = require('./../constants/keyMaker.js');

// This is the agent which executes related tasks, capturing new tasks and reporting status.
const Agent = class {
  constructor(agentManager, name) {
    this.id = keyMaker();
    this.agentManager = agentManager;
    this.taskManager = agentManager.taskManager;
    this.pluginManager = agentManager.pluginManager;
    this.userManager = agentManager.userManager;
    this.store = agentManager.memoryManager.activeStore;
    this.status = 'pending';
    //TODO Add a name field with a user provided name that will be used in the store/load functions
    this.name = name || '';
  }

  // returns any properties that are not references to other objects
  getDataProperties() {

  }

  // Reports a message to the console.
  report(text) {
    console.log(`Agent ${this.name || this.id} reports ${text}`);
  }

  // Gets the model used by the agent.
  model() {
    return this.taskManager.model;
  }

  // Gets the memory store used by the agent.
  store() {
    return this.taskManager.store;
  }

  // Starts the agent.
  start() {
    this._run();
  }

  // Says a message to the user.
  say(text) {
    if (this.userManager) {
      this.userManager.say(text);
    }
  }

  // Adds subtasks to the task manager.
  _addSubTasks(tasks) {
    for (const task of tasks) {
      this.taskManager.addTask(task);
    }
  }

  // Runs the agent loop.
  async _run() {
    this.status = 'running';
    while (true) {
      // Get the next task.
      const task = await this.taskManager.myNextTask(this, 'pending');

      // If there are no more tasks, stop.
      if (!task && !this.taskManager.myNextTask(this)) {
        this.status = 'finished';
        this.report('The agent is finished.');
        break;
      }
      if (task) {
          // Log the task.
          this.report(`Starting task: ${task.name || task.id}`);

          if (this.agentManager.okayToContinue()) {
            // Try to execute the task.
            try {
              this.agentManager.useOneStep();
              const result = await task.execute();
              // Report task feedback/errors to user
              if (result.text) { this.say(result.text) };
              if (result.results.error) { this.say(result.results.error) };
              result.forEach(cmdResp => {
                cmdResp.forEach(plugResp => {
                  this.say(plugResp.text);
                  this._addSubTasks(plugResp.tasks);
                });
              });

              // Log the result of the task.
              this.report(`Finished task: ${task.name || this.id}`);
              this.taskManager.complete(task);
              if (this.store) {
                this.store.save(task);
              }
            } catch (error) {
              console.error(`Error executing task: ${error}`);
            }
          }
      }
    }
  }
};

module.exports = Agent;
