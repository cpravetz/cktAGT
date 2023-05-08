// Copyright 2023 Seakaytee, Inc.
//
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

// This module provides a class for representing a Redis backend.

const redis = require("redis");
const getDataProperties = require('./../constants/utils.js');

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
        this.client.on('error', err => console.log('Redis Client Error', err));
      } catch (error) {
        console.log(`Error connecting to redis: ${error}`);
      }
    }
  }

  // Save a task.
  save(task) {
    if (!this.client) {
        this.connect();
    }
    try {
      let savedTask = getDataProperties(task);
      this.client.set(`task:${savedTask.id}`, JSON.stringify(savedTask));
    } catch (error) {
      console.error(`Error saving task: ${error}`);
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
    } catch (error) {
      console.error(`Error loading task: ${error}`);
    }
  }

  // Delete a task.
  delete(taskId) {
    if (!this.client) {
        this.connect();
    }
    try {
      this.client.del(`task:${taskId}`);
    } catch (error) {
      console.error(`Error deleting task: ${error}`);
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
    } catch (error) {
      console.error(`Error getting active agents: ${error}`);
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
    } catch (error) {
      console.error(`Error getting active agents: ${error}`);
    }
  }

  saveAgent(agent) {
    if (!this.client) {
        this.connect();
    }
    try {
      let savedAgent = getDataProperties(agent);
      this.client.set(`agent:${savedAgent.id}`, JSON.stringify(savedAgent));
    } catch (error) {
      console.error(`Error saving agent: ${error}`);
    }
  }

  // Load a task.
  load(agentId) {
    if (!this.client) {
        this.connect();
    }
    try {
      const agent = JSON.parse(this.client.get(`agent:${agentId}`));
      return agent;
    } catch (error) {
      console.error(`Error loading agent: ${error}`);
    }
  }

}


module.exports = RedisBackend;

