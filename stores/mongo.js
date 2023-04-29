// Copyright 2023 Seakaytee, Inc.
//
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

// This module provides a class for representing a MongoDB backend.

const mongodb = require("mongodb");

class MongoDBBackend {

  name = "mongodb";

  // The MongoDB client.
  client;

  // The MongoDB database.
  db;

  // Constructor.
  constructor() {
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
    return this.db.collection("tasks").updateOne({
      id: task.id,
    }, {
      $set: task,
      upsert: true,
    });
  }

  // Load a task.
  load(taskId) {
    const task = this.db.collection("tasks").findOne({
      id: taskId,
    });
    return task;
  }

  // Delete a task.
  delete(taskId) {
    return this.db.collection("tasks").deleteOne({
      id: taskId,
    });
  }

}


module.exports = MongoDBBackend;
