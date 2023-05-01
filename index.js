// Copyright 2023 Seakaytee, Inc.
//
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

// This module provides a class for representing an AI Agent app.

const express = require("express");
const fs = require("fs");
const path = require("path");
const http = require('http');
const dotenv = require("dotenv").config();

const app = express();
const server = http.createServer(app);
const { Server } = require("socket.io");

const io = new Server(server);

const AgentManager = require("./managers/agentManager.js");
const UserManager = require("./managers/userManager.js");
UserManager.io = io;


// This is the main function.
async function main() {
  //set up the workspace directory
  let workDirName = process.env.WORKING_DIR || './workspace';
  const isAbsolute = /^[a-z]+:\/\//i.test(workDirName);
  // If the path is not absolute, prepend the current working directory
  if (!isAbsolute) {
    workDirName = `${__dirname}/${workDirName}`;
  }
  // If the directory does not exist, create it
  if (!fs.existsSync(workDirName)) {
    fs.mkdirSync(workDirName);
  }

  // Create the agent manager.
  const agentManager = new AgentManager(UserManager, workDirName);

  // Start the server.
  await server.listen(3000);
  console.log('listening on *:3000');
}


// This function handles file requests
app.get("*", (req, res) => {
  // Get the request url.
  let url = req.originalUrl || 'index.html';
  if (url == '/') {url = '/index.html'};
  // Check if the request url is for a static file.
  if (fs.existsSync(path.join(__dirname, url))) {
    // Send the static file.
    res.sendFile(path.join(__dirname, url));
  } else {
    // Send a 404 error.
    res.status(404).send("The requested resource was not found.");
  }
});


// This function handles socket connections.
io.on("connection", (socket) => {
  // When a user says something, tell the agent manager to hear it.
  socket.on("userSays", (msg) => {
    agentManager.hear(msg);
  });
  socket.on("userApproves", (msg) => {
    agentManager.allowMoreSteps(msg.continuous, msg.steps);
  })
});


// Start the main function.
main();
