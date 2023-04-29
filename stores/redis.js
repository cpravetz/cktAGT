// Copyright 2023 Seakaytee, Inc.
//
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

// This module provides a class for representing a Redis backend.

const redis = require("redis");

class RedisBackend {

  name="redis";

  // The Redis client.
  client;

  // Constructor.
  constructor() {
    this.client = new redis.Client();
  }

  // Save a task.
  save(task) {
    this.client.set("task:", JSON.stringify(task));
  }

  // Load a task.
  load(taskId) {
    const task = JSON.parse(this.client.get("task:"));
    return task;
  }

  // Delete a task.
  delete(taskId) {
    this.client.del("task:");
  }

}


module.exports = RedisBackend;
