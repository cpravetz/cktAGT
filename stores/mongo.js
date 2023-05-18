// Copyright 2023 Seakaytee, Inc.
//
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

// This module provides a class for representing a MongoDB backend.

const mongodb = require("mongodb");
const replaceObjectReferencesWithIds = require("./../constants/utils.js");

class MongoDBBackend  {


  // The MongoDB client.
  client;

  // The MongoDB database.
  db;

  // Constructor.
  constructor(options = {}) {
    this.url = options.url || process.env.MONGO_URL;
    this.name = "mongodb";
    this.client = false;
  }

  async connect() {
    this.db = false;
    this.client = new mongodb.MongoClient(this.url);
    try {
      await this.client.connect();
      this.db = this.client.db();
    }
    catch (err) {
      throw err;
    }
  }

  // Save a task.
  async save(task) {
    if (!this.client || !this.db) {
        await this.connect();
    }
    let savedTask = replaceObjectReferencesWithIds(task);
    return await this.db.collection("tasks").updateOne({
      id: savedTask.id,
    }, {
      $set: savedTask
    }, {
      upsert: true
    })
  };

  // Load a task.
  async load(taskId) {
    if (!this.client|| !this.db) {
        await this.connect();
    }
    const task = await this.db.collection("tasks").findOne({
      id: taskId,
    });
    return task;
  }

  // Delete a task.
  async delete(taskId) {
    if (!this.client|| !this.db) {
      await this.connect();
    }
    return await this.db.collection("tasks").deleteOne({
      id: taskId,
    });
  }

  async loadTasksForAgent(agentId) {
    if (!this.client|| !this.db) {
      await this.connect();
    }
    const tasks = await this.db.collection("tasks").find({
      agentId: agentId, status: {$ne: 'finished'}
    });
    return tasks;
  }

  // return an array of names
  async getAgentNames() {
    if (!this.client|| !this.db) {
      await this.connect();
    }
    const agentList = this.db.collection("agents").find({status: {$ne: 'finished'}});
    const agentNamesAndIds = {};
    for await (const a of agentList) {
        agentNamesAndIds[a.id] = a.name;
    };
    return agentNamesAndIds;
  }

  async saveAgent(agent) {
    if (!this.client|| !this.db) {
      await this.connect();
    }
    const savedAgent = replaceObjectReferencesWithIds(agent);
    return await this.db.collection("agents").updateOne({
      id: agent.id,
    }, {
      $set: savedAgent
    }, {
      upsert: true
    });
  }

  async loadAgent(agentId) {
    if (!this.client|| !this.db) {
      await this.connect();
    }
    const agent = await this.db.collection("agents").findOne({
      id: agentId,
    });
    return agent;
  }

}


module.exports = MongoDBBackend;
