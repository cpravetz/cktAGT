// Copyright 2023 Seakaytee, Inc.
//
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

// This module provides a class for representing a local JSON files backend.

const fs = require("fs");
const getDataProperties = require('./../constants/utils.js');

class LocalJsonFilesBackend {

  // The directory where tasks are stored.
  tasksDir;

  // Constructor.
  constructor(tasksDir) {
    this.name = 'local';
    this.tasksDir = tasksDir || './../workspace';
    if (!fs.existsSync(this.tasksDir)) {
      fs.mkdir(this.tasksDir, (e,r) => {if (e) { console.error(e)}});
    }
  }

  // Save a task.
  save(task) {
    let savedTask = getDataProperties(task);
    const taskPath = `${this.tasksDir}/${savedTask.id}.json`;
    fs.writeFileSync(taskPath, JSON.stringify(savedTask));
    return task;
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
