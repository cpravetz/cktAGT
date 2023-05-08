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
    gettingName: 3,
    awaitingGoal : 4,
    running : 5
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


  //adds a new Agent to the subAgent dictionary
  addSubAgent(agent, start) {
    this.subAgents[agent.id] = agent;
    if (start) {
        agent.start();
    }
  }

  getSubAgent(agentId) {
    return this.subAgents[agentId] || false;
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
    this.memoryManager.saveAgent(this.agent);
  }


  loadAnAgent(id) {
    if (!id) {
      console.log('No id passed to agentManager to load');
      return false;
    }
    this.agent = this.memoryManager.loadAgent(id);
    if (this.agent) {
        this.startTheAgent();
    }
  }

  createFirstAgent(input) {
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
    this.memoryManager.saveAgent(this.agent);
  }


  // Ask user, start new agent or load existing agent?
  getNewGoal() {
    console.log('Asking for new goal');
    this.ask(Strings.newAgentMsg);
    this.status = Status.awaitingGoal;
  }

  doLoadOrNew(input) {
   console.log('Responding to start or load agent'+input);
    if (input.response == 'start') {
      this.status = Status.naming;
      this.ask('What do you want to name your new agent?');
    } else {
        this.status = Status.gettingName;
        this.ask({prompt:'What agent do you want to load?', choices: this.memoryManager.activeStore.getAgentNames(), allowMultiple:false});
    }

  }

  askLoadOrNew() {
    console.log('Asking to start or load agent');
    this.userManager.parent = this;
    // Get the user's input.
    const input = this.ask({prompt:Strings.welcome, choices: Strings.startLoadAsk, allowMultiple:false});
    this.status = Status.waiting;
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
        this.agentName = input.response || 'unnamed';
        this.getNewGoal();
      } else
      if (this.status == Status.gettingName) {
        this.agentId = input.response || false;
        this.loadAnAgent(this.agentId);
      } else
      if (this.status == Status.awaitingGoal) {
        this.createFirstAgent(input);
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
