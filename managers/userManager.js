// Copyright 2023 Seakaytee, Inc.
//
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

// This module provides a class for managing user interactions.

const keyMaker = require("../constants/keymaker.js");

class UserManager {

  // This constructor initializes the user manager.
  constructor(app, req, io, parent) {
    this.app = app;
    this.req = req;
    this.io = io;
    this.asks = [];
    this.parent = parent;
  }

  // This method sends a message to the server.
  say(text) {
    console.log('saying ' + JSON.stringify(text));
    this.io.emit('serverSays', text);
  }

  // This method handles a message from the server.
  hear(message) {
    console.log('heard ' + JSON.stringify(message));
    let msg;
    try {
      msg = JSON.parse(message);
    } catch {
      msg = message;
    }
    if (msg.id) {
      const index = this.asks.indexOf(ask => ask.id === msg.id);
      if (index >= 0) {
        this.asks.splice(index, 1);
      }
    }
    if (this.parent) {
      this.parent.hear(msg);
    }
  }

  // This method asks the user a question.
  ask(prompt, choices, allowMultiple) {
    console.log('asking... ');
    const lastAsk = {
      id: keyMaker(),
      prompt: prompt,
      choices: choices,
      allowMultiple: allowMultiple
    };
    this.say(lastAsk);
    this.asks.push(lastAsk);
  }

  // This method announces a new file to the server.
  announceFile(name, url) {
    this.io.emit('serverFileAdd', { name: name, url: url });
  }
}

module.exports = UserManager;