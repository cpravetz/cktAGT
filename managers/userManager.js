// Copyright 2023 Seakaytee, Inc.
//
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

// This module provides a class for managing user interactions.

const keyMaker = require("../constants/keymaker.js");
const logger = require('./../constants/logger.js');

const MSG_RESEND_INTERVAL = 1500;

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

  sendAndSave(code,msg) {
    msg.code = code;
    this.io.emit(msg.code, msg);
    this.tells.set(msg.id, msg);
  }

  addListener(listener) {
   if (listener && (typeof(listener.hear) === 'function')) {
     this.listeners.add(listener);
   }
  }

  resendOldMsgs(uMgr) {
    const cutoff = new Date() - MSG_RESEND_INTERVAL;
    for (const [key, tell] of uMgr.tells) {
      if ((tell.when || 0) < cutoff) {
        this.io.emit(tell.code, tell);
        tell.when = new Date();
      }
    }
  }

  // This method sends a message to the server.
  say(text) {
    const msg = {id: keyMaker(), content: text, when: new Date() };
    this.sendAndSave('serverSays',msg);
    if (!this.looping) {
      this.looping = true;
      const self = this;
      setInterval(() => {self.resendOldMsgs(self)}, MSG_RESEND_INTERVAL);
    }
  }

  updateTasksOnBrowser(tasksMap) {
    const tasks = [];
    for (const [key,task] of tasksMap) {
      tasks.push( task.asUpdateObject());
    };
    this.io.emit('tasksChanged',{id: keyMaker(), tasks: tasks, when: new Date() });
    logger.info('Reported Task Change to clients');
  }

  acknowledgeRecd(messageId) {
    try {
      this.tells.delete(messageId);
    } catch (error) {
      logger.info('Tried to ack unknown msg')
    }
  }
  

  // This method handles a message from the server.
  hear(message) {
    let msg;
    try {
      msg = JSON.parse(message);
    } catch (err) {
      logger.error({error:err, message: message},`Error parsing JSON in hear ${err.message}`);
      return err;
    }
    if (msg.id) {
      this.asks.delete(msg.id);
    }

    for (const listener of this.listeners) {
      listener.hear(msg);
    }
  }

  requestStepApproval() {
    logger.info('Requested step approval');
    const msg = {id:keyMaker()};
    this.sendAndSave('serverNeedsApproval',msg);
  }

  // This method asks the user a question.
  ask(prompt, choices = false, allowMultiple = false) {
    logger.debug({prompt: prompt, choices:choices, multi:allowMultiple}, 'Asking... ');
    // Check that prompt is a string
    if (typeof prompt !== "string") {
      throw new Error("prompt must be a string, it is ");
    }
  
    // Check that allowMultiple is a boolean
    if (typeof(allowMultiple) !== "boolean") {
      throw new Error("allowMultiple must be a boolean");
    }
  
    // Do something with prompt and choices
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
    logger.debug({name:name, url:url}, 'announcingFile');
    if (typeof(name) !== "string" || typeof(url) !== "string" ) {
      throw new Error("invalid name or url in announceFile");
    }
    const msg = {id: keyMaker(),name: name, url: url };
    this.sendAndSave('serverFileAdd',msg);
  }
}


module.exports = UserManager;