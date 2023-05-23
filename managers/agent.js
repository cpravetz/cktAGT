// Copyright 2023 Seakaytee, Inc.
//
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

const keyMaker = require('./../constants/keymaker.js');
const logger = require('./../constants/logger.js');

/**
 * This is the agent which executes related tasks, capturing new tasks and reporting status.
 */
class Agent {

  constructor(agentManager, name = '') {
    this.id = keyMaker();
    this.agentManager = agentManager;
    this.taskManager = agentManager.taskManager;
    this.pluginManager = agentManager.pluginManager;
    this.userManager = agentManager.userManager;
    this.modelManager = agentManager.modelManager;
    this.store = agentManager.memoryManager.activeStore;
    this.status = 'pending';
    this.name = name;
  }

  report(text) {
    logger.info(`Agent ${this.name} reports ${text}`);
    this.userManager.say(text);
  }


  getModel() {
    return this.taskManager.model || this.modelManager.activeModel;
  }

  start() {
    try {
      this._run();
    } catch (err) {
      logger.error({error:err},`Error starting agent: ${err.message}`);
    }
  }

  say(text) {
    if (this.userManager) {
      this.userManager.say(text);
    }
  }

  _addSubTasks(newTasks) {
    newTasks.forEach((task) => {
      task.agent = this;
      this.taskManager.addTask(task);
    });
  }

  _processResult(result) {
    if (result.text) {
      this.say(result.text);
    }
    if (result.error) {
      this.say(result.error);
    }
    result.responses.forEach((cmdResp) => {
      if (cmdResp.text) {
        this.say(cmdResp.text);
      }
      if (cmdResp.error) {
        this.say(`Error reported: ${cmdResp.error}`);
      }
      if (cmdResp.tasks) {
        this._addSubTasks(cmdResp.tasks);
      }
    });
  }

  async _executeOneTask(task) {
    this.agentManager.useOneStep();
    try {
      const result = await task.execute();
      logger.debug({result:result, task:task},'executeOne task results')
      this._processResult(result || {});
      this.report(`Finished task: ${task.name || task.id}`);
      this.taskManager.complete(task);
    } catch (err) {
      task.status = 'failed';
      logger.error({error:err, result:result, task:task}, `Error executingOneTask ${err.message}`);
    }
    if (this.store) {
      this.store.save(task);
    }
  }

  async _run() {
    this.status = 'running';
    while (!['paused', 'finished'].includes(this.status)) {
      const task = this.taskManager.myNextTask(this, 'pending');
      if (!task && this.taskManager.tasks.size == 0) {
        this.status = 'finished';
        this.report('The agent is finished.');
        this.store.saveAgent(this);
        break;
      }
      if (task) {
        if (!this.agentManager.okayToContinue(task)) {
          this.status = 'paused'
        } else {
          this.report(`Starting task: ${task.name || task.id}`);
          try {
            await this._executeOneTask(task);
          } catch (err) {
            logger.error({error:err, task:task},`Error executing task ${err.message}`);
            break;
          }
        }
      }
    }
  }
}


module.exports = Agent;