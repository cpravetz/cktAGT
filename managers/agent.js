// Copyright 2023 Seakaytee, Inc.
//
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

const keyMaker = require('./../constants/keymaker.js');
const logger = require('./../constants/logger.js');
const PluginManager = require("./pluginManager.js");

/**
 * This is the agent which executes related tasks, capturing new tasks and reporting status.
 */
class Agent {

  constructor(agentManager, name = '') {
    this.id = keyMaker();
    this.agentManager = agentManager;
    this.taskManager = agentManager.taskManager;
    this.userManager = function() { return agentManager.userManager};
    this.modelManager = agentManager.modelManager;
    this.store = agentManager.memoryManager.activeStore;
    this.status = 'pending';
    this.name = name;
  }

  debugData() {
    return {
      id: this.id,
      name: this.name,
      status: this.status,
      manager: this.agentManager
    }
  }

  report(text) {
    logger.info(`Agent ${this.name} reports ${text}`);
    this.userManager().say(text);
  }

  pluginManager() {
    return PluginManager.getInstance();
  }
  getModel() {
    return this.taskManager.model || this.modelManager.activeModel;
  }

  start() {
    logger.debug(`Starting agent ${this.id}`)
    try {
      this._run();
    } catch (err) {
      logger.error({error:err},`Error starting agent: ${err.message}`);
    }
  }

  say(text) {
      this.userManager().say(text);
  }

  _setStatus(s) {
    this.status = s;
    logger.debug(`Agent status set to ${s}`);
  }

  _addSubTasks(newTasks) {
    newTasks.forEach((task) => {
      task.agent = this;
      this.taskManager.addTask(task);
    });
    this.userManager().updateTasksOnBrowser(this.taskManager.tasks);
  }

  //dump tasks and commands
  reportOverview() {
/*    logger.debug('--Overview Begin--');
    for (const key of this.taskManager.tasks.keys()) {
      const task = this.taskManager.tasks.get(key);
      logger.debug(`task name:${task.name} status:${task.status}`);
      for (const command of task.commands) {
          logger.debug(`   command:${command.name}`);
          if (command.args?.prompt) {logger.debug(`     prompt:${command.args.prompt}`);}
          if (command.args?.model)  {logger.debug(`     model:${command.args.model}`);}
          if (command.args?.filename)  {logger.debug(`     filename:${command.args.filename}`);}
          if (command.args?.url)  {logger.debug(`     url:${command.args.url}`);}
          if (command.args?.find)  {logger.debug(`     find:${command.args.find}`);}
          if (command.args?.newCommand)  {logger.debug(`     newCommand:${command.args.newCommand}`);}
          if (command.args?.executeDoes)  {logger.debug(`     executeDoes:${command.args.executeDoes}`);}
      }
      logger.debug('');
    }
    logger.debug('--Overview End--');
  */
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
    this.report(`Starting task: ${task.name || task.id}`);
    this.agentManager.useOneStep();
    try {
      task.status = 'running';
      this.userManager().updateTasksOnBrowser(this.taskManager.tasks);
      const result = await task.execute();
      logger.debug({result:result, task:task.debugData()},'executeOne task results')
      this._processResult(result || {});
      this.report(`Finished task: ${task.name || task.id}`);
      task.status = 'finished';
      this.userManager().updateTasksOnBrowser(this.taskManager.tasks);
      this.taskManager.complete(task);
    } catch (err) {
      task._setStatus('failed');
      logger.error({error:err, result:result, task:task.debugData()}, `Error executingOneTask ${err.message}`);
    }
    if (this.store) {
      this.store.save(task);
    }
  }

  async _run() {
    this._setStatus('running');
    this.reportOverview();
    while (!['paused', 'finished'].includes(this.status)) {
      const task = this.taskManager.myNextTask(this, 'pending');
      if (!task && this.taskManager.tasks.size == 0) {
        this._setStatus('finished');
        this.report('The agent is finished.');
        this.reportOverview();
        this.store.saveAgent(this);
        break;
      }
      if (task) {
        if (!this.agentManager.okayToContinue(task)) {
          this._setStatus('paused');
        } else {
          try {
            await this._executeOneTask(task);
            this.reportOverview();
          } catch (err) {
            logger.error({error:err, task:task.debugData()},`Error executing task ${err.message}`);
            break;
          }
        }
      }
    }
  }
}


module.exports = Agent;