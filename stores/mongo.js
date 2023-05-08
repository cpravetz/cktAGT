// Copyright 2023 Seakaytee, Inc.
//
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

// This module provides a class for representing a MongoDB backend.

const mongodb = require("mongodb");
const getDataProperties = require("./../constants/utils.js");

class MongoDBBackend  {


  // The MongoDB client.
  client;

  // The MongoDB database.
  db;

  // Constructor.
  constructor() {
    this.name = "mongodb";
    this.client = false;
  }

  connect() {
    this.client = new mongodb.MongoClient(process.env.MONGO_URL);
    this.client.connect((err,db) => {
        if (err) {
            console.log(err)
        } else {
            this.db = db;
        }})
  }

  // Save a task.
  save(task) {
    if (!this.client) {
        this.connect();
    }
    let savedTask = getDataProperties(task);
    return this.db.collection("tasks").updateOne({
      id: savedTask.id,
    }, {
      $set: savedTask,
      upsert: true,
    });
  }

  // Load a task.
  load(taskId) {
    if (!this.client) {
        this.connect();
    }
    const task = this.db.collection("tasks").findOne({
      id: taskId,
    });
    return task;
  }

  // Delete a task.
  delete(taskId) {
    if (!this.client) {
        this.connect();
    }
    return this.db.collection("tasks").deleteOne({
      id: taskId,
    });
  }

  // return an array of names
  getAgentNames() {
    if (!this.client) {
        this.connect();
    }
    const agentList = this.db.collection("agents").find({status: {$not: 'finished'}});
    const agentNamesAndIds = {};
    agentList.forEach(a => {
        agentNamesAndIds[a.id] = a.name;
    });
    return agentNamesAndIds;
  }

  saveAgent(agent) {
    if (!this.client) {
        this.connect();
    }
    const savedAgent = getDataProperties(agent);
    return this.db.collection("agents").updateOne({
      id: agent.id,
    }, {
      $set: savedAgent,
      upsert: true,
    });

  }

  loadAgent(agentId) {
    if (!this.client) {
        this.connect();
    }
    const agent = this.db.collection("agents").findOne({
      id: agentId,
    });
    return agent;
  }

}


module.exports = MongoDBBackend;
