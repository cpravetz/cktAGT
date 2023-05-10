// Copyright 2023 Seakaytee, Inc.
//
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

// This module provides a class for managing user interactions.

const keyMaker = require("../constants/keymaker.js");

class UserManager {

  // This constructor initializes the user manager.
  constructor(app, io) {
    this.app = app;
    this.io = io;
    this.asks = new Map();
    this.listeners = new Set();
    this.id = keyMaker();
  }

  addListener(listener) {
   if (listener && (typeof(listener.hear) === 'function')) {
     this.listeners.add(listener);
   }
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
    } catch (error) {
      console.error('Error parsing JSON:', error);
      return error;
    }
    if (msg.id) {
      this.asks.delete(msg.id);
    }

    for (const listener of this.listeners) {
      listener.hear(msg);
    }
  }

  requestStepApproval() {
    console.log('Requested step approval');
    this.io.emit('serverNeedsApproval', {});
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
    this.asks.set(lastAsk.id, lastAsk);
  }

  // This method announces a new file to the server.
  announceFile(name, url) {
    this.io.emit('serverFileAdd', { name: name, url: url });
  }
}


module.exports = UserManager;