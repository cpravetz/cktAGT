// Copyright 2023 Seakaytee, Inc.
//
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

const fs = require("fs");
const path = require("path");
const keyMaker = require("../constants/keymaker.js");

// This is the MemoryManager class.
class MemoryManager {
  // This is a dictionary of available memory stores.
  memoryStores = {};

  //This is the data store that was identified in the env variables.
  activeStore;

  // This constructor initializes the memory manager.
  constructor() {
    this.id = keyMaker();
    this.loadMemoryStores();
    this.activeStore = this.getMemoryStore(process.env.MEMORY_STORE || "local");
  }

  // This method loads the memory stores from the `memory_stores` directory.
  // We are doing this during early development.  By production, we should only load the store
  // identified in MEMORY_STORE
  loadMemoryStores() {
    const memoryStoresDir = "./stores";
    for (const file of fs.readdirSync(memoryStoresDir)) {
      const memoryStorePath = path.join(memoryStoresDir, file);
      if (fs.statSync(memoryStorePath).isFile() && memoryStorePath.endsWith(".js")) {
        const memoryModule = require(`../${memoryStorePath}`);
        let memoryStore = new memoryModule;
        //For now, only save the chosen memory Plugin.  In the future, it may be
        //useful to have other loaded to support functional plugin access to these
        //storage systems.
        if (memoryStore.name == (process.env.MEMORY_STORE || "local")) {
            if (memoryStore.connect)  { memoryStore.connect() };
            this.memoryStores[memoryStore.name] = memoryStore;
        }
      }
    }
  }

  // This method gets a memory store by name.
  getMemoryStore(name) {
    return this.memoryStores[name];
  }

  // Saves the task.
  save(task) {
    this.activeStore.save(task);
  }

  // Loads the task.
  load(taskId) {
    return this.activeStore.load(taskId);
  }

  // Deletes the task.
  delete(taskId) {
    this.activeStore.delete(taskId);
  }

}

module.exports = MemoryManager;
