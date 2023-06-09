// Generated by CodiumAI

const dotenv = require("dotenv").config();
const ModelManager = require("./../managers/modelManager.js");
const PluginManager = require("./../managers/pluginManager.js");
const TaskManager = require("./../managers/taskManager.js");
const MemoryManager = require("./../managers/memoryManager.js");
const AgentManager = require('./../managers/agentManager.js');
const Agent = require('./../managers/agent.js');
const Strings = require("../constants/strings.js");
const logger = require('./../constants/logger.js');

const Status = {
    launching : 0,
    waiting : 1,
    naming: 2,
    gettingName: 3,
    awaitingGoal : 4,
    running : 5
}


/*
Code Analysis

Main functionalities:
The AgentManager class is responsible for managing agents, which are entities that can perform tasks and interact with users. It handles the creation and loading of agents, as well as the management of subagents. The class also manages the plugin, model, memory, and task managers used by the agents, and communicates with the user through a user manager.

Methods:
- addSubAgent(agent, task, start): adds a new subagent to the subAgents dictionary and starts it if specified
- getSubAgent(agentId): retrieves a subagent from the subAgents dictionary by ID
- informTheLLM(input): adds a think task for feedback from the user
- startTheAgent(): starts the agent and saves it to memory
- loadAnAgent(id): loads an existing agent from memory by ID and starts it
- createFirstAgent(input): creates a new agent and adds an initial task to its queue
- getNewGoal(): asks the user for a new goal
- doLoadOrNew(input): handles the user's response to whether to start a new agent or load an existing one
- askLoadOrNew(): asks the user whether to start a new agent or load an existing one
- say(text): sends a message to the user through the user manager
- ask(prompt): asks the user a question through the user manager
- hear(msg): handles input from the user and performs the appropriate action
- allowMoreSteps(continuous, count): approves the agent to proceed with a certain number of steps
- useOneStep(): decrements the remainingSteps field by 1
- okayToContinue(task): determines whether the agent can continue with a task based on the remainingSteps field and whether the task's dependencies are satisfied

Fields:
- status: the current status of the agent manager
- continuous: a boolean indicating whether the agent can continue without user approval
- remainingSteps: the number of steps the agent is allowed to take without user approval
- subAgents: a map of subagents launched by the primary or other subagents
- modelManager: the model manager used by the agent manager
- memoryManager: the memory manager used by the agent manager
- taskManager: the task manager used by the agent manager
- userManager: the user manager used by the agent manager
- workDirName: the name of the working directory for the agent manager
- agentName: the name of the agent being created
- agentId: the ID of the agent being loaded
- requestedStepApproval: a boolean indicating whether the agent has requested user approval to take more steps
*/



describe('AgentManager_class', () => {

    // Tests creating a new AgentManager instance with valid parameters. 
    it("test_creating_agent_manager_instance", () => {
        const userManager = {};
        const workDirName = "testDir/";
        const agentManager = new AgentManager(userManager, workDirName);
        expect(agentManager.status).toBe(Status.launching);
        expect(agentManager.continuous).toBe(false);
        expect(agentManager.remainingSteps).toBe(0);
        expect(agentManager.subAgents).toEqual(new Map());
        expect(agentManager.modelManager).toBeInstanceOf(ModelManager);
        expect(agentManager.memoryManager).toBeInstanceOf(MemoryManager);
        expect(agentManager.taskManager).toBeInstanceOf(TaskManager);
        expect(agentManager.userManager).toBe(userManager);
        expect(agentManager.workDirName).toBe(workDirName);
    });

    // Tests adding a sub-agent to the subAgents dictionary. 
    it("test_add_sub_agent", () => {
        const userManager = {};
        const workDirName = "testDir/";
        const agentManager = new AgentManager(userManager, workDirName);
        const subAgent = {id: "123", start: jest.fn()};
        const task = {id:'345'};
        agentManager.addSubAgent(subAgent, task, false);
        expect(agentManager.subAgents.get("123")).toBe(subAgent);
        expect(agentManager.taskManager.tasks.size).toBe(1);
    });

    // Tests loading an existing agent. 
    it("test_load_agent", () => {
        const userManager = {};
        const workDirName = "testDir/";
        const agentManager = new AgentManager(userManager, workDirName);
        agentManager.memoryManager.loadAgent = jest.fn(() => ({id: "456", getModel() {return false}, start: jest.fn()}));
        agentManager.loadAnAgent("456");
        expect(agentManager.agent.id).toBe("456");
        expect(agentManager.agent.start).toHaveBeenCalled();
    });

    // Tests handling input from the user. 
    it("test_handle_input", () => {
        const userManager = {ask: jest.fn(() => ({response: "start"})), say: jest.fn()};
        const workDirName = "testDir/";
        const agentManager = new AgentManager(userManager, workDirName);
        agentManager.createFirstAgent = jest.fn();
        agentManager.startTheAgent = jest.fn();
        agentManager.loadAnAgent = jest.fn();
        agentManager.informTheLLM = jest.fn();
        agentManager.askLoadOrNew();
        agentManager.doLoadOrNew({response: "start"});
        expect(agentManager.status).toBe(Status.naming);
        agentManager.hear({response: "agentName"});
        expect(agentManager.status).toBe(Status.awaitingGoal);
        agentManager.hear({goal: "testGoal"});
        expect(agentManager.createFirstAgent).toHaveBeenCalledWith({goal: "testGoal"});
        expect(agentManager.startTheAgent).toHaveBeenCalled();
        agentManager.status = Status.gettingName;
        agentManager.hear({response: "123"});
        expect(agentManager.loadAnAgent).toHaveBeenCalledWith("123");
        agentManager.status = Status.running;
        agentManager.hear({input: "testInput"});
        expect(agentManager.informTheLLM).toHaveBeenCalledWith({input: "testInput"});
    });

    // Tests creating a new agent. 
    it("test_create_agent", () => {
        const userManager = {};
        const workDirName = "testDir/";
        const agentManager = new AgentManager(userManager, workDirName);
        agentManager.agentName = "testAgent";
        agentManager.memoryManager.saveAgent = jest.fn();
        agentManager.createFirstAgent("testGoal");
        expect(agentManager.agent).toBeInstanceOf(Agent);
        expect(agentManager.agent.name).toBe("testAgent");
        expect(agentManager.taskManager.tasks.size).toBe(1);
        expect(agentManager.memoryManager.saveAgent).toHaveBeenCalledWith(agentManager.agent);
    });
    
});
