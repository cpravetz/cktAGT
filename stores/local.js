// Copyright 2023 Seakaytee, Inc.
//
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

// This module provides a class for representing a local JSON files backend.

const fs = require("fs");

class LocalJsonFilesBackend {

  name = 'local';

  // The directory where tasks are stored.
  tasksDir;

  // Constructor.
  constructor(tasksDir) {
    this.tasksDir = tasksDir;
  }

  // Save a task.
  save(task) {
    const taskPath = `${this.tasksDir}/${task.id}.json`;
    fs.writeFileSync(taskPath, JSON.stringify(task));
  }

  // Load a task.
  load(taskId) {
    const taskPath = `${this.tasksDir}/${taskId}.json`;
    const task = JSON.parse(fs.readFileSync(taskPath));
    return task;
  }

  // Delete a task.
  delete(taskId) {
    const taskPath = `${this.tasksDir}/${taskId}.json`;
    fs.unlinkSync(taskPath);
  }

}


module.exports = LocalJsonFilesBackend;
