// Copyright 2023 Seakaytee, Inc.
//
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

// This module provides a class for representing an AI Agent app.

const express = require("express");
const fs = require("fs");
const path = require("path");
const http = require('http');
const dotenv = require("dotenv").config();
const  logger = require('./constants/logger.js');
const pinoExpress = require('pino-http');

const app = express();
const server = http.createServer(app);
const { Server } = require("socket.io");

const io = new Server(server);

const AgentManager = require("./managers/agentManager.js");
const UserManager = require("./managers/userManager.js");
UserManager.io = io;

let agentManager;

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

  //create the userManager
  const userManager = new UserManager(app, io);
  // Create the agent manager.
  agentManager = new AgentManager(userManager, workDirName);
  userManager.addListener(agentManager);


  // Start the server.
  server.listen(3000);
  logger.info('listening on *:3000');
}

//app.use(pinoExpress);

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
  socket.on("userLog",  (msg) => {
    logger.info({msg:msg},'User sends error');
  });

  socket.on("userApproves", (msg) => {
    logger.info('User approves proceeding');
    agentManager.allowMoreSteps(msg.continuous, msg.steps || 0);
  });

  socket.on('userAck', (msg) => {
    agentManager.acknowledgeRecd(msg);
  });

  socket.on('error', (error) => {
    logger.error(error,`Socket error ${err.message}`)
  });


});


// Start the main function.
main();
