// Copyright 2023 Seakaytee, Inc.
//
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

// This module provides a class for representing a Pinecone backend.

const pinecone = require("pinecone");

class PineconeBackend {

  // The Pinecone client.
  client;

  // Constructor.
  constructor() {
    this.client = new pinecone.Client();
  }

  // Save a task.
  save(task) {
    this.client.save(task);
  }

  // Load a task.
  load(taskId) {
    const task = this.client.load(taskId);
    return task;
  }

  // Delete a task.
  delete(taskId) {
    this.client.delete(taskId);
  }

}


module.exports = PineconeBackend;
