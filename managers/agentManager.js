// Copyright 2023 Seakaytee, Inc.
//
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

const ModelManager = require("./modelManager.js");
const PluginManager = require("./pluginManager.js");
const TaskManager = require("./taskManager.js");
const MemoryManager = require("./memoryManager.js");
const Agent = require("./agent.js");
const Task = require("./task.js");
const keyMaker = require("../constants/keymaker.js");
const Strings = require("../constants/strings.js");

// This is the AgentManager class.
class AgentManager {

  // The current status of the agent manager.
  status = "idle";

  //Don't go continuous unless instructed by the user
  continuous = false;

  // Start off allowing one step
  remainingSteps = 1;

  // The plugin manager used by the agent manager.
  pluginManager;

  // The model manager used by the agent manager.
  modelManager;

  // The memory manager used by the agent manager.
  memoryManager;

  // The task manager used by the agent manager.
  taskManager;

  // The user manager used by the agent manager.
  userManager;

  workDirName;

  // Creates a new AgentManager instance.
  constructor(userManager, workDirName) {
    this.pluginManager = new PluginManager();
    this.modelManager = new ModelManager();
    this.memoryManager = new MemoryManager();
    this.taskManager = new TaskManager(this.modelManager.activeModel, this.memoryManager.activeStore);
    this.userManager = userManager;
    this.workDirName = workDirName;
    if (workDirName[workDirName.length - 1] !== '/') {
        this.workDirName = this.workDirName + '/'
    }
  }

  // Starts the agent manager.
  start() {
    this.userManager.parent = this;
    // Get the user's input.
    const input = this.ask(Strings.welcome);
    this.status = "waiting";
  }

  // Begins a new task.
  begin(input) {
    // Create a new agent.
    const agent = new Agent(keyMaker(), this) //this.taskManager, this.pluginManager, this.userManager, this.memoryManager.activeStore);
    const commands = [{name: "Think", args: {prompt: input}}];
    // Create a new task.
    const task = new Task(agent, keyMaker(), "Initial Task", "we are processing the goal and constraints", input, commands, "", []);

    // Add the task to the queue.
    this.taskManager.addTask(task);

    agent.start();
    this.status = "running";
  }

  // Says a message to the user.
  say(text) {
    if (this.userManager) {
      this.userManager.say(text);
    } else {
      console.log("said: ", text);
    }
  }

  // Asks the user a question.
  ask(prompt) {
    if (this.userManager) {
      return this.userManager.ask(prompt);
    } else {
      console.log("Asking before UM available: ", prompt);
      return null;
    }
  }

  // Handles input from the user.
  hear(msg) {
    const input = JSON.parse(msg) || msg;

    // Deal with input supplied by the user, probably in response to an ask
    if (this.status == "idle") {
      this.start();
    } else if (this.status == "waiting") {
      this.begin(input);
    } else {
      this.say("Gotcha");
      // TODO: Deal with the message from the user
    }
  }

  allowMoreSteps(continuous, count) {
    this.continuous = continuous;
    this.remainingSteps += count || 0;
  }

  useOneStep() {
    this.remainingSteps -= 1;
  }

  okayToContinue() {
    return this.continuous || (this.remainingSteps > 0);
  }
}

module.exports = AgentManager;
