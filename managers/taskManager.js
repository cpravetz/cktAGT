// Copyright 2023 Seakaytee, Inc.
//
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

// This module provides a class for managing tasks.
const keyMaker = require("../constants/keymaker.js");
const  logger = require('./../constants/logger.js');

class TaskManager {

  // This is a queue of open tasks.
  tasks;

    // This constructor initializes the task manager.
  constructor(model, datastore) {
    this.id = keyMaker();
    this.tasks = new Map();
    this.model = model || null;
    this.store = datastore || null;
  }

  // This method adds a task to the queue.
  addTask(task) {
    logger.debug({task:task.debugData()},'taskManager: Added a task');
    if (task.id) {
      this.tasks.set(task.id, task);
      if (this.store) {
        this.store.save(task);
      }
    }
  }

  // This method pops a task from the queue and executes it.
  complete(task) {
    task.status = 'finished';
    logger.debug({task:task.debugData()},'taskManager: Completed task');
    this.tasks.delete(task.id);
  }

  // myNextTask returns the next task for the given agent with the status given
  // no status means all tasks
  myNextTask(agent, status) {
    // Declare a variable to store the first task in the array.
    let firstTask = null;
    for (const key of this.tasks.keys()) {
      const task = this.tasks.get(key);
      if ((task.agent.id === agent.id) && (!status || (task.status === status))) {
        firstTask = task;
        break;
      }
    }
    logger.debug({task:firstTask.debugData()},'taskManager: Returning next task');
    return firstTask;
  }

}

module.exports = TaskManager;
