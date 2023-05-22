// Copyright 2023 Seakaytee, Inc.
//
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

// This module provides a class for representing an AI Agent app.
const chai = require('chai');
const expect = chai.expect;
const http = require('http');
const AgentManager = require('./../managers/agentManager.js');
const index = require('./../index.js');
const fetch =  require('node-fetch');
const dotenv = require("dotenv").config();

// This is the Mocha test suite.
describe("AI Agent App", () => {
  // This test ensures that the server is listening on port 3000.
  it("should be listening on port 3000", async () => {

    // Make a request to the server.
    const request = await fetch("http://localhost:3000/");

    // Check that the request was successful.
    expect(request.status).to.equal(200);
  });

});
