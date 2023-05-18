// Generated by CodiumAI

const dotenv = require("dotenv").config();

const MongoDBBackend = require('./../stores/mongo.js');
const keyMaker = require('./../constants/keymaker.js');

/*
Code Analysis

Main functionalities:
The MongoDBBackend class provides a backend implementation for a task management system using MongoDB as the database. It allows for saving, loading, and deleting tasks and agents, as well as loading tasks for a specific agent and getting a list of agent names. The class uses the MongoDB Node.js driver to interact with the database.

Methods:
- connect(): connects to the MongoDB database using the MONGO_URL environment variable
- save(task): saves a task to the "tasks" collection in the database, replacing object references with their IDs
- load(taskId): loads a task from the "tasks" collection in the database based on its ID
- delete(taskId): deletes a task from the "tasks" collection in the database based on its ID
- loadTasksForAgent(agentId): loads all tasks for a specific agent from the "tasks" collection in the database that are not finished
- getAgentNames(): gets a list of agent names and IDs from the "agents" collection in the database that are not finished
- saveAgent(agent): saves an agent to the "agents" collection in the database, replacing object references with their IDs
- loadAgent(agentId): loads an agent from the "agents" collection in the database based on its ID

Fields:
- client: the MongoDB client used to connect to the database
- db: the MongoDB database object used to interact with the database
- name: the name of the backend implementation (always "mongodb")
*/



describe('MongoDBBackend_class', () => {

    // Tests that a task can be saved correctly. 
    it("test_save_task", async () => {
        const backend = new MongoDBBackend();
        const task = {id: 1, name: "Task 1", agentId: 1, status: "pending", randomData: keyMaker()};
        const result = await backend.save(task);
        expect(result.modifiedCount + result.upsertedCount).toBe(1);
    });

    // Tests that a task can be loaded correctly. 
    it("test_load_task", async () => {
        const backend = new MongoDBBackend();
        const taskId = 1;
        const task = await backend.load(taskId);
        expect(task.id).toBe(taskId);
    });

    // Tests that a task can be deleted correctly. 
    it("test_delete_task", async () => {
        const backend = new MongoDBBackend();
        const taskId = 1;
        const result = await backend.delete(taskId);
        expect(result.deletedCount).toBe(1);
    });

    // Tests that tasks can be loaded correctly for a given agent. 
    it("test_load_tasks_for_agent", async () => {
        const backend = new MongoDBBackend();
        const task = {id: 1, name: "Task 1", agentId: 1, status: "pending"};
        await backend.save(task);
        const agentId = 1;
        const tasks = await backend.loadTasksForAgent(agentId);
        tasks.forEach(task => {
            expect(task.agentId).toBe(agentId);
            expect(task.status).not.toBe("finished");
        });
    });

    // Tests that agent names and IDs are returned correctly. 
    it("test_get_agent_names", async () => {
        const backend = new MongoDBBackend();
        const agent = {id: 1, name: "Agent 1", status: "available"};
        await backend.saveAgent(agent);
        const agentNamesAndIds = await backend.getAgentNames();
        expect(Object.keys(agentNamesAndIds).length).toBeGreaterThan(0);
    });

    // Tests that an agent can be saved correctly. 
    it("test_save_agent", async () => {
        const backend = new MongoDBBackend();
        const agent = {id: 1, name: "Agent 1", status: "available", randomData: keyMaker()};
        const result = await backend.saveAgent(agent);
        expect(result.modifiedCount + result.upsertedCount).toBe(1);
    });
});
