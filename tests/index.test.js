// Copyright 2023 Seakaytee, Inc.
//
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

// This module provides a class for representing an AI Agent app.
const chai = require('chai');
const expect = chai.expect;
const http = require('http');
const dotenv = require("dotenv").config();
const AgentManager = require('./../managers/agentManager.js');

const index = require('./../index.js');

// This is the Mocha test suite.
describe("AI Agent App", () => {
  // This test ensures that the server is listening on port 3000.
  it("should be listening on port 3000", async () => {

    // Make a request to the server.
    const request = await new Request("http://localhost:3000/");

    // Check that the request was successful.
    expect(request.status).to.equal(200);
  });

  let agentManager;

  // This test ensures that the agent manager can hear user input.
  it("should be able to hear user input", async () => {
    // Create a new agent manager.
    agentManager = new AgentManager({},process.env.WORKING_DIR);

    // Send a message to the agent manager.
    agentManager.hear("Hello, world!");

    // Check that the agent manager received the message.
    expect(agentManager.lastMessage).to.equal("Hello, world!");
  });

  // This test ensures that the agent manager can allow more steps.
  it("should be able to allow more steps", async () => {
    // Create a new agent manager.
    const agentManager = new AgentManager({}, process.env.WORKING_DIR);

    // Send a message to the agent manager.
    agentManager.hear("Hello, world!");

    // Allow the agent manager to take more steps.
    agentManager.allowMoreSteps(true, 10);

    // Check that the agent manager was allowed to take more steps.
    expect(agentManager.canTakeMoreSteps).to.equal(true);
  });
});
