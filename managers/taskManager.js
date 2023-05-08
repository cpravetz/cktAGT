// Copyright 2023 Seakaytee, Inc.
//
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

// This module provides a class for managing tasks.
const keyMaker = require("../constants/keymaker.js");

class TaskManager {

  // This is a queue of open tasks.
  tasks = [];

  // History has completed tasks
  history = [];

  // This constructor initializes the task manager.
  constructor(model, datastore) {
    this.id = keyMaker();
    this.model = model || null;
    this.store = datastore || null;
  }

  // This method adds a task to the queue.
  addTask(task) {
    this.tasks[task.id] = task;
    if (this.store) {
      this.store.save(task);
    }
  }

  // This method pops a task from the queue and executes it.
  complete(task) {
    task.status = 'finished';
    this.history.push(task);
    delete this.tasks[task.id];
  }

  // myNextTask returns the next task for the given agent with the status given
  // no status means all tasks
  myNextTask(agent, status) {
    // Declare a variable to store the first object in the array.
    let firstTask;
    for (const key in this.tasks) {
      const task = this.tasks[key];
      if ((task.agent.id === agent.id) && (!status || (task.status == status))) {
        firstTask = task;
        break;
      }
    }
    return firstTask;
  }
}

module.exports = TaskManager;
