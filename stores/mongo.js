// Copyright 2023 Seakaytee, Inc.
//
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

// This module provides a class for representing a MongoDB backend.

const mongodb = require("mongodb");

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
    let savedTask = {...task};
    savedTask.agentId = task.agent.id;
    savedTask.agent = null;
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

}


module.exports = MongoDBBackend;
