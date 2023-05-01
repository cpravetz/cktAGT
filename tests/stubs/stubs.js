const Bard = require('./../../models/bard.js');

// Copyright 2023 Seakaytee, Inc.
//
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

class stubTask {

  // This constructor initializes a task.
  constructor(agent, id, name, description, goal, commands, context, dependencies) {
  }


  // This method adds a dependency to the task.
  addDependency(dependency) {
  }

  // This method removes a dependency from the task.
  removeDependency(dependency) {
  }

  // This method updates the progress of the task.
  updateProgress(progress) {
  }

  // This method executes the task.
  async execute() {
    return [];
  }

  // This method converts the output from the execute function into workproducts and new tasks.
  resolve() {
  }
}

class stubTaskManager {

  // This constructor initializes the task manager.
  constructor(model, datastore) {
  }

  // This method adds a task to the queue.
  addTask(task) {
  }

  // This method pops a task from the queue and executes it.
  complete(task) {
  }

  // myNextTask returns the next task for the given agent with the status given
  // no status means all tasks
  myNextTask(agent, status) {
    return {};
  }
}

class stubPluginManager {

  // This is a dictionary of available plugins.
  plugins= {} //{ [key: string]: any } = {};

  // This constructor initializes the plugin manager.
  constructor() {
  }

  // This method loads the plugins from the `plugins` directory.
  loadPlugins() {
  }

  // This method gets a plugin by name.
  getPlugin(name) {
    return false;
  }

  // This method returns the plugin(s) that can process a given command.
  getPluginsFor(command) {
    return [];
  }

  // This method takes a given command for a task and finds the correct plugins to process it, then calls those in turn.
  async resolveCommand(command, task) {
    const results = [];
    return results;
  }
}

class stubModelManager {

  //The activeModel is the default model identified in environment variables.
  //This one gets the initial task for a new agent, and other tasks not assigned a specific model
  activeModel;

  // This constructor initializes the model manager.
  constructor() {
  }

  // This method loads the models from the `models` directory.
  loadModels() {
  }

  // This method gets a model by name.
  getModel(name)  {
    return new Bard();
  }
}

class stubMemoryManager {
  // This is a dictionary of available memory stores.
  memoryStores = {};

  //This is the data store that was identified in the env variables.
  activeStore  = 'local';

  // This constructor initializes the memory manager.
  constructor() {
  }

  // This method loads the memory stores from the `memory_stores` directory.
  // We are doing this during early development.  By production, we should only load the store
  // identified in MEMORY_STORE
  loadMemoryStores() {
  }

  // This method gets a memory store by name.
  getMemoryStore(name) {
    return this.activeStore;
  }

  // Saves the task.
  save(task) {
  }

  // Loads the task.
  load(taskId) {
    return new Task();
  }

  // Deletes the task.
  delete(taskId) {
  }
}


class stubAgentManager {

  // Creates a new AgentManager instance.
  constructor(userManager) {
    this.modelManager = new stubModelManager();
    this.memoryManager = new stubMemoryManager();
  }

  // Starts the agent manager.
  start() {
  }

  // Begins a new task.
  begin(input) {
  }

  // Says a message to the user.
  say(text) {
  }

  // Asks the user a question.
  async ask(prompt) {
    return '';
  }

  // Handles input from the user.
  hear(msg) {
  }

  allowMoreSteps(continuous, count) {
  }

  useOneStep() {
  }

  okayToContinue() {
    return true
  }
}

stubAgent = class {
  // This is the agent which executes related tasks, capturing new tasks and reporting status.
  // TODO Add a mechanism to pause the run loop until the user provides a go signal through sockets.io
  agentManager = new stubAgentManager();

  // Reports a message to the console.
  report(text) {
  }

  // Gets the model used by the agent.
  model() {
    return new stubModel();
  }

  // Gets the memory store used by the agent.
  store() {
    return new stubMemoryStore();
  }

  // Starts the agent.
  start() {
  }


  // Says a message to the user.
  say(text) {
  }

  // Adds subtasks to the task manager.
  _addSubTasks(tasks) {
  }

  // Runs the agent loop.
  async _run() {
  }
};


module.exports = { stubTaskManager, stubModelManager, stubPluginManager, stubAgent, stubMemoryManager, stubAgentManager, stubTask};
