// Copyright 2023 Seakaytee, Inc.
//
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

// This module provides a class for representing a Redis backend.

const redis = require("redis");

class RedisBackend {

  // The Redis client.
  client;

  // Constructor.
  constructor() {
    this.name="redis";
    this.host = process.env.REDIS_HOST || 'localhost';
    this.port = process.env.REDIS_PORT || '6379';
    this.memoryIndex = process.env.MEMORY_INDEX || 'cktAGT';
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
    try {
      let savedTask = task;
      savedtask.agentId = task.agent.id;
      savedTask.agent = null;
      this.client.set(`task:${savedTask.id}`, JSON.stringify(savedTask));
    } catch (error) {
      console.error(`Error saving task: ${error}`);
    }
  }

  // Load a task.
  load(taskId) {
    try {
      const task = JSON.parse(this.client.get(`task:${taskId}`));
      return task;
    } catch (error) {
      console.error(`Error loading task: ${error}`);
    }
  }

  // Delete a task.
  delete(taskId) {
    try {
      this.client.del(`task:${taskId}`);
    } catch (error) {
      console.error(`Error deleting task: ${error}`);
    }
  }

}


module.exports = RedisBackend;

