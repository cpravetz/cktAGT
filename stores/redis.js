// Copyright 2023 Seakaytee, Inc.
//
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

// This module provides a class for representing a Redis backend.

const redis = require("redis");
const replaceObjectReferencesWithIds = require('./../constants/utils.js');
const logger = require('./../constants/logger.js');

class RedisBackend {

  // The Redis client.
  client;

  // Constructor.
  constructor() {
    this.name="redis";
    this.host = process.env.REDIS_HOST || 'localhost';
    this.port = process.env.REDIS_PORT || '6379';
    this.client = false;
  }

  connect() {
    if (this.host) {
      try {
        this.client = redis.createClient({ username: process.env.REDIS_USERNAME || '',
                                           password: process.env.REDIS_PASSWORD || '',
                                           host: this.host, port: this.port });
        this.client.on('error', err => logger.error({error:err}, 'Redis Client Error'));
      } catch (err) {
        logger.error({error:err}, `Error connecting to redis`);
      }
    }
  }

  // Save a task.
  save(task) {
    if (!this.client) {
        this.connect();
    }
    try {
      let savedTask = replaceObjectReferencesWithIds(task);
      this.client.set(`task:${savedTask.id}`, JSON.stringify(savedTask));
    } catch (err) {
      logger.error({error:err, task: task},`Redis: Error saving task`);
    }
  }

  // Load a task.
  load(taskId) {
    if (!this.client) {
        this.connect();
    }
    try {
      const task = JSON.parse(this.client.get(`task:${taskId}`));
      return task;
    } catch (err) {
      logger.error({error:err, taskId: taskId},`Redis: Error loading task`);
    }
  }

  // Delete a task.
  delete(taskId) {
    if (!this.client) {
        this.connect();
    }
    try {
      this.client.del(`task:${taskId}`);
    } catch (err) {
      logger.error({error:err, taskId: taskId},`Redis: Error deleting task`);
    }
  }

 async loadTasksForAgent(agentId) {
    if (!this.client) {
      this.connect();
    }
    try {
      const keys = await this.client.keys('task:*');
      const tasks = [];
      for (let i = 0; i < keys.length; i++) {
        const task = JSON.parse(this.client.get(keys[i]));
        if (task.status !== 'finished' && task.agentId == agentId) {
          tasks.push(task)
        }
      }
      return tasks;
    } catch (err) {
      logger.error({error:err},`Redis: Error getting tasks for agent`);
      return false;
    }

 }

  async getAgentNames() {
    if (!this.client) {
      this.connect();
    }
    try {
      const keys = await this.client.keys('agent:*');
      const activeAgents = {};
      for (let i = 0; i < keys.length; i++) {
        const agent = JSON.parse(this.client.get(keys[i]));
        if (agent.status !== 'finished') {
          activeAgents[agent.id] = agent.name;
        }
      }
      return activeAgents;
    } catch (err) {
      logger.error({error:err},`Redis: Error getting agent names`);
    }
  }

  saveAgent(agent) {
    if (!this.client) {
        this.connect();
    }
    try {
      let savedAgent = replaceObjectReferencesWithIds(agent);
      this.client.set(`agent:${savedAgent.id}`, JSON.stringify(savedAgent));
    } catch (err) {
      logger.error({error:err, agent:agent},`Redis: Error saving agent`);
    }
  }

  // Load a task.
  loadAgent(agentId) {
    if (!this.client) {
        this.connect();
    }
    try {
      const agent = JSON.parse(this.client.get(`agent:${agentId}`));
      return agent;
    } catch (err) {
      logger.error({error:err, agentId: agentId},`Redis: Error loading agent`);
    }
  }

}


module.exports = RedisBackend;

