// Copyright 2023 Seakaytee, Inc.
//
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

const fs = require("fs");
const path = require("path");
const keyMaker = require("../constants/keymaker.js");
const logger = require('../constants/logger.js');

// This is the MemoryManager class.
class MemoryManager {
  memoryStores;
  activeStore;

  constructor() {
    this.id = keyMaker();
    this.memoryStores = new Map();
    this.loadMemoryStores();
    this.activeStore = this.getMemoryStore(process.env.MEMORY_STORE || "local");
  }

  async loadMemoryStores() {
    const memoryStoresDir = "./stores";
    try {
      for (const file of fs.readdirSync(memoryStoresDir)) {
        const memoryStorePath = path.join(memoryStoresDir, file);
        if (fs.statSync(memoryStorePath).isFile() && memoryStorePath.endsWith(".js")) {
          const memoryModule = require(`../${memoryStorePath}`);
          let memoryStore = new memoryModule;
          if (memoryStore.name == (process.env.MEMORY_STORE || "local")) {
            if (memoryStore.connect)  { await memoryStore.connect() };
            this.memoryStores.set(memoryStore.name, memoryStore);
          }
        }
      }
    } catch (err) {
      logger.error({error:err},`Error loading memory stores ${err.message}`);
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

  delete(taskId) {
    if (this.activeStore) {
      this.activeStore.delete(taskId);
    }
  }

  saveAgent(agent) {
    if (this.activeStore) {
      const chatThread = agent.getModel().getCache ? agent.getModel().getCache() : [];
      const saveObject = {id: agent.id, agent: agent, thread: chatThread};
      return this.activeStore.saveAgent(saveObject);
    }
  }

  async loadAgent(agentId, agentManager) {
    if (this.activeStore) {
      const loadObject = await this.activeStore.loadAgent(agentId);
      const savedAgent = loadObject.agent;
      savedAgent.agentManager = agentManager;
      savedAgent.taskManager = agentManager.taskManager;
      savedAgent.pluginManager = agentManager.pluginManager;
      savedAgent.userManager = agentManager.userManager;
      if (loadObject.thread) { savedAgent.getModel().setCache(loadObject.thread); }
      const agentTasks = await this.activeStore.loadTasksForAgent(savedAgent.id);
      for (const t of Object.values(agentTasks)) {
        t.agent = savedAgent;
        agentManager.taskManager.addTask(t);
      }
    }
  }

  getMemoryStore(name) {
    return this.memoryStores.get(name);
  }
}

module.exports = MemoryManager;