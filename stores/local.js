// Copyright 2023 Seakaytee, Inc.
//
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

// This module provides a class for representing a local JSON files backend.

const fs = require("fs");
const path = require("path");
const replaceObjectReferencesWithIds = require('./../constants/utils.js');

class LocalJsonFilesBackend {

  // The directory where tasks are stored.
  tasksDir;
  agentDir;
  // Constructor.
  constructor(tasksDir) {
    this.name = 'local';
    this.tasksDir = tasksDir || './../workspace';
    this.agentDir = path.join(tasksDir || './../workspace', '/agents');
    if (!fs.existsSync(this.tasksDir)) {
      fs.mkdir(this.tasksDir, (e,r) => {if (e) { console.error(e)}});
    }
    if (!fs.existsSync(this.agentDir)) {
      fs.mkdir(this.agentDir, (e,r) => {if (e) { console.error(e)}});
    }
  }

  // Save a task.
  save(task) {
    let savedTask = replaceObjectReferencesWithIds(task);
    const taskPath = `${this.tasksDir}/${savedTask.id}.json`;
    fs.writeFileSync(taskPath, JSON.stringify(savedTask), {flags: 'w'});
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

  async loadTasksForAgent(agentId) {
    const tasks = [];
    for (const file of fs.readdirSync(this.taskDir)) {
      if (file.endsWith('.json')) {
        const task = JSON.parse(fs.readFileSync(path.join(this.taskDir, file)));
        if (task.status != 'finished' && task.agentId == agentId) {
          tasks.push(task);
        }
      }
    }
    return tasks;
  }


  // return an array of names
  getAgentNames() {
    const agents = {};
    for (const file of fs.readdirSync(this.agentDir)) {
      if (file.endsWith('.json')) {
        const agent = JSON.parse(fs.readFileSync(path.join(this.agentDir, file)));
        if (agent.status != 'finished') {
          agents[agent.id] = agent.name;
        }
      }
    }
    return agents;
  }

  saveAgent(agent) {
    const savedAgent = replaceObjectReferencesWithIds(agent);
    const agentPath = `${this.agentDir}/${savedAgent.id}.json`;
    fs.writeFileSync(agentPath, JSON.stringify(savedAgent), {flags: 'w'});
    return savedAgent;

  }

  loadAgent(agentId) {
    const agentPath = `${this.agentDir}/${agentId}.json`;
    const agent = JSON.parse(fs.readFileSync(agentPath));
    return agent;
  }

}


module.exports = LocalJsonFilesBackend;
