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
            if (memoryStore.connect)  { memoryStore.connect() }
            this.memoryStores[memoryStore.name] = memoryStore;
        }
      }
    }
  }

  save(task) {
      if (this.activeStore) {
          return this.activeStore.save(task);
      }
  }

  load(taskId) {
      if (this.activeStore) {
          return this.activeStore.load(taskId);
      }
  }

  // Deletes the task.
  delete(taskId) {
    if (this.activeStore) {
        this.activeStore.delete(taskId);
    }
  }

  saveAgent(agent) {
      if (this.activeStore) {
          return this.activeStore.saveAgent(agent);
      }
  }

  loadAgent(agentId, agentManager) {
    if (this.activeStore) {
      const savedAgent = this.activeStore.loadAgent(agentId);
      //Expand savedAgent, connect to Managers
      savedAgent.agentManager = agentManager;
      savedAgent.taskManager = agentManager.taskManager;
      savedAgent.pluginManager = agentManager.pluginManager;
      savedAgent.userManager = agentManager.userManager;
      savedAgent.store = this.activeStore;
      //Load tasks for this agent
      const agentTasks = this.activeStore.loadTasksForAgent(savedAgent.id);
        for (const t in agentTasks) {
            t.agent = savedAgent;
            agentManager.taskManager.addTask(t);
        }
    }
  }
  // This method gets a memory store by name.
  getMemoryStore(name) {
    return this.memoryStores[name];
  }

}

module.exports = MemoryManager;
