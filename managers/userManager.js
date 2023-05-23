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
    this.tells = new Map();
    this.asks = new Map();
    this.listeners = new Set();
    this.id = keyMaker();
    this.looping = false;
  }

  addListener(listener) {
   if (listener && (typeof(listener.hear) === 'function')) {
     this.listeners.add(listener);
   }
  }

  resendOldMsgs(uMgr) {
    const cutoff = new Date() - 1500;
    for (const [key, tell] of uMgr.tells) {
      if ((tell.when || 0) < cutoff) {
        uMgr.io.emit(tell.code, tell);
        tell.when = new Date();
      }
    }
  }

  // This method sends a message to the server.
  say(text) {
    const msg = {id: keyMaker(), content: text, when: new Date() };
    this.io.emit('serverSays', msg);
    msg.code = 'serverSays';
    this.tells.set(msg.id, msg);
    if (!this.looping) {
      this.looping = true;
      const self = this;
      setInterval(() => {self.resendOldMsgs(self)}, 1500);
    }
  }

  acknowledgeRecd(messageId) {
    try {
      this.tells.delete(messageId);
    } catch (error) {
      console.log('Tried to ack unknown msg')
    }
  }
  

  // This method handles a message from the server.
  hear(message) {
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
    const msg = {id:keyMaker()};
    this.io.emit('serverNeedsApproval', msg);
    msg.code = 'serverNeedsApproval';
    this.tells.set(msg.id, msg);

  }

  // This method asks the user a question.
  ask(prompt, choices = [], allowMultiple = false) {
    // Check that prompt is a string
    if (typeof prompt !== "string") {
      throw new Error("prompt must be a string, it is ");
    }
  
    // Check that choices is an array or null
    /*if (choices === null) {
      choices = [];
    } else if (!Array.isArray(choices)) {
      throw new Error("choices must be an array");
    }
  */
    // Check that allowMultiple is a boolean
    if (typeof(allowMultiple) !== "boolean") {
      throw new Error("allowMultiple must be a boolean");
    }
  
    // Do something with prompt and choices
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
    if (typeof(name) !== "string" || typeof(url) !== "string" ) {
      throw new Error("invalid name or url in announceFile");
    }
    const msg = {id: keyMaker(),name: name, url: url };
    this.io.emit('serverFileAdd', msg);
    msg.code = 'serverFileAdd';
    this.tells.set(msg.id, msg);
  }
}


module.exports = UserManager;