// Copyright 2023 Seakaytee, Inc.
//
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

const chai = require('chai');
const expect = chai.expect;
const RedisBackend= require('./../stores/redis.js');

// This is the Mocha test suite.
describe("Redis Backend", () => {

  let backend;

  // This test ensures that the backend can be instantiated.
  it("should be able to be instantiated", () => {
    // Create a new backend instance.
    backend = new RedisBackend();

    // Check that the backend instance is not null.
    expect(backend).not.to.be.null;
  });

  // This test ensures that the backend can save a task.
  it("should be able to save a task", async () => {
    // Create a new task.
    const task = {
      id: "1234567890",
      title: "My Task",
      description: "This is my task.",
    };

    // Save the task.
    await backend.save(task);

    // Check that the task was saved successfully.
    const savedTask = await backend.load(task.id);
    expect(savedTask).to.equal(task);
  });

  // This test ensures that the backend can load a task.
  it("should be able to load a task", async () => {
    // Create a new task.
    const task = {
      id: "1234567890",
      title: "My Task",
      description: "This is my task.",
    };

    // Save the task.
    await backend.save(task);

    // Load the task.
    const loadedTask = await backend.load(task.id);

    // Check that the loaded task is the same as the saved task.
    expect(loadedTask).to.equal(task);
  });

  // This test ensures that the backend can delete a task.
  it("should be able to delete a task", async () => {
    // Create a new task.
    const task = {
      id: "1234567890",
      title: "My Task",
      description: "This is my task.",
    };

    // Save the task.
    await backend.save(task);

    // Delete the task.
    await backend.delete(task.id);

    // Check that the task was deleted successfully.
    expect(await backend.load(task.id)).to.be.null;
  });

});
