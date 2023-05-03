// Copyright 2023 Seakaytee, Inc.
//
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

// This module provides a class for managing tasks.

class TaskManager {

  // This is a queue of open tasks.
  tasks = [];

  // History has completed tasks
  history = [];

  // This constructor initializes the task manager.
  constructor(model, datastore) {
    this.model = model || null;
    this.store = datastore || null;
  }

  // This method adds a task to the queue.
  addTask(task) {
    this.tasks.push(task);
    if (this.store) {
      this.store.save(task);
    }
  }

  // This method pops a task from the queue and executes it.
  complete(task) {
    this.history.push(task);
    let i = this.tasks.indexOf(task);
    if (i > -1) {
      this.tasks.splice(i, 1);
    }
  }

  // myNextTask returns the next task for the given agent with the status given
  // no status means all tasks
  myNextTask(agent, status) {
    // Declare a variable to store the first object in the array.
    let firstTask;

    for (const task of this.tasks) {
      if ((task.agent.id === agent.id) && (!status || (task.status == status))) {
        firstTask = task;
        break;
      }
    }
    return firstTask;
  }
}

module.exports = TaskManager;
