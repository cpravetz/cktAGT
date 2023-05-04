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

const Status = {
    launching : 0,
    waiting : 1,
    naming: 2,
    awaitingGoal : 3,
    running : 4
}
// This is the AgentManager class.
class AgentManager {

  // The current status of the agent manager.
  status = Status.launching;

  //Don't go continuous unless instructed by the user
  continuous = false;

  // Start off allowing one step
  remainingSteps = 1;

  // Subagents track additional agents launched by the primary or other subagents
  subAgents = [];

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
    this.id = keyMaker();
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

  //Add a think task for feedback from the user
  informTheLLM(input) {
    console.log('informingLLM:'+input);
    const commands = [{name: "Think", args: {prompt: input}}];
    const task = new Task({agent:this.agent, name:"User Feedback", goal:input, commands:commands});
    // Add the task to the queue.
    this.taskManager.addTask(task);
    this.say('Understood');
  }

  // Starts the agent manager.
  startTheAgent() {
   console.log('starting the agent');
    this.agent.start();
    this.status = Status.running;
  }

  createNewAgent(input) {
    console.log('creating a new agent');
    // Create a new agent.
    this.agent = new Agent(this);
    this.agent.name = this.agentName || this.agent.id;
    const commands = [{name: "Think", args: {prompt: input}}];
    // Create a new task.
    const task = new Task({agent:this.agent, name:"Initial Task",
            description:"we are processing the goal and constraints", goal:input, commands:commands});
    // Add the task to the queue.
    this.taskManager.addTask(task);
  }


  // Ask user, start new agent or load existing agent?
  getNewGoal() {
    console.log('Asking for new goal');
    this.ask(Strings.newAgentMsg);
    this.status = Status.awaitingGoal;
  }

  doLoadOrNew(input) {
   console.log('Responsing to start or load agent'+input);
    if (input.response == Strings.startNewAgent) {
      this.status = Status.naming;
      this.ask('What do you want to name your new agent?');
    } else {
     //Get the name of an agent from the user and TODO restart it
    }

  }

  askLoadOrNew() {
    console.log('Asking to start or load agent');
    this.userManager.parent = this;
    // Get the user's input.
    const input = this.ask({prompt:Strings.welcome, choices: [Strings.startNewAgent,Strings.restartAgent]}, false);
    this.status = Status.waiting;

    //create a new agent or load an existing one
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
    if (this.status == Status.launching) {
        this.askLoadOrNew();
    } else
      if (this.status == Status.waiting) {
        this.doLoadOrNew(input);
      } else
      if (this.status == Status.naming) {
        this.agentName = input || false;
        this.getNewGoal();
      } else
      if (this.status == Status.awaitingGoal) {
        this.createNewAgent(input);
        this.startTheAgent();
      } else
        this.informTheLLM(input);
  }

  allowMoreSteps(continuous, count) {
    console.log('Approved to proceed');
    this.continuous = continuous;
    this.remainingSteps += count || 0;
  }

  useOneStep() {
    this.remainingSteps -= 1;
  }

  okayToContinue(task) {
    return (this.continuous || (this.remainingSteps > 0)) && task?.dependenciesSatisfied();
  }
}

module.exports = AgentManager;
