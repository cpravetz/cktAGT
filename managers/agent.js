// Copyright 2023 Seakaytee, Inc.
//
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

const keyMaker = require('./../constants/keymaker.js');
const logger = require('./../constants/logger.js');
const PluginManager = require("./pluginManager.js");

const STATUS_PENDING = 'pending';
const STATUS_PAUSED = 'paused';
const STATUS_RUNNING = 'running';
const STATUS_FINISHED = 'finished';
const STATUS_FAILED = 'failed';

/**
 * This is the agent which executes related tasks, capturing new tasks and reporting status.
 */
class Agent {

  constructor(agentManager, name = '') {
    this.id = keyMaker();
    this.agentManager = agentManager;
    this.taskManager = agentManager.taskManager;
    this.userManager = agentManager.userManager;
    this.modelManager = agentManager.modelManager;
    this.store = agentManager.memoryManager.activeStore;
    this.status = STATUS_PENDING;
    this.name = name;
    this.conversations = new Map();
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
    this.say(text);
  }

  pluginManager() {
    return PluginManager.getInstance();
  }

  getModel() {
    return this.taskManager.model || this.modelManager.activeModel;
  }

  getConversation(modelName) {
    return this.conversations.get(modelName) || [];
  }

  setConversation(modelName, conversation) {
    return this.conversations.set(modelName, conversation);
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
      this.userManager.say(text);
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
    this.userManager.updateTasksOnBrowser(this.taskManager.tasks);
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
    result.responses.forEach((cmdOutcome) => {
      if (cmdOutcome.text) {
        this.say(cmdOutcome.text);
      }
      if (cmdOutcome.error) {
        this.say(`Error reported: ${cmdOutcome.error}`);
      }
      if (cmdOutcome.tasks) {
        this._addSubTasks(cmdOutcome.tasks);
      }
    });
  }

  async _executeOneTask(task) {
    this.report(`Starting task: ${task.name || task.id}`);
    this.agentManager.useOneStep();
    try {
      task.setStatus(STATUS_RUNNING);
      this.userManager.updateTasksOnBrowser(this.taskManager.tasks);
      const result = await task.execute();
      logger.debug({result:result},'executeOne task results')
      this._processResult(result || {});
      this.report(`Finished task: ${task.name || task.id}`);
      task.setStatus(STATUS_FINISHED);
      this.userManager.updateTasksOnBrowser(this.taskManager.tasks);
      this.taskManager.complete(task);
    } catch (err) {
      task.setStatus(STATUS_FAILED);
      logger.error({error:err, result:result, task:task.debugData()}, `Error executingOneTask ${err.message}`);
    }
    if (this.store) {
      this.store.save(task);
    }
  }

  wrapUp() {
    this._setStatus(STATUS_FINISHED);
    this.report('The agent is finished.');
    this.reportOverview();
    this.store.saveAgent(this);
    //TODO Add code to give parentAgent the heads up
  }

  async _run() {
    this._setStatus(STATUS_RUNNING);
    this.reportOverview();
    while (![STATUS_PAUSED, STATUS_FINISHED].includes(this.status)) {
      const task = this.taskManager.myNextTask(this, STATUS_PENDING);
      if (!task && this.taskManager.tasks.size == 0) {
        this.wrapUp();
        break;
      }
      if (task) {
        if (!this.agentManager.okayToContinue(task)) {
          this._setStatus(STATUS_PAUSED);
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