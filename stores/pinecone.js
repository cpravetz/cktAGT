// Copyright 2023 Seakaytee, Inc.
//
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

// This module provides a class for representing a Pinecone backend.
const getDataProperties = require('./../constants/utils.js');

class PineconeBackend {

  constructor(apiKey, indexName) {
    this.apiKey = process.env.PINECONE_API_KEY || false;
    this.indexName = 'cktAgtTasks';
    this.apiUrl = `https://api.pinecone.io/v1/indexes/${this.indexName}/objects`;
    this.headers = {
      'Authorization': `API-Key ${this.apiKey}`,
      'Content-Type': 'application/json'
    };
    this.agentIndexName = 'cgtAgents';
    this.agentUrl = `https://api.pinecone.io/v1/indexes/${this.agentIndexName}/objects`;
  }


  async _grab(url) {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.headers
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`Object with ID ${id} has been loaded.`, result);
        return result;
      } else {
        console.error(`Failed to load object with ID ${id}.`, response);
        return null;
      }
  }

  async _put(url, obj) {
    const id = obj.id;
    const body = JSON.stringify(obj);

    const response = await fetch(url, {
         method: 'PUT',
         headers: this.headers,
         body: body
    });

    if (response.ok) {
      const result = await response.json();
      return result;
      console.log(`Object with ID ${id} has been saved.`, result);
    } else {
      console.error(`Failed to save object with ID ${id}.`, response);
    }
  }

  async save(task) {
    if (this.apiKey) {
      let savedTask = getDataProperties(task);
      return this._put(`${this.apiUrl}/${id}`,savedTask);
    }
  }

  async load(taskId) {
    if (this.apiKey) {
      const id = taskId;
      return await this._grab(`${this.apiUrl}/${id}`);
    }
  }

  async delete(taskId) {
    if (this.apiKey) {
      const id = taskId;

      const response = await fetch(`${this.apiUrl}/${id}`, {
        method: 'DELETE',
        headers: this.headers
      });

      if (response.ok) {
        console.log(`Object with ID ${id} has been deleted.`);
      } else {
        console.error(`Failed to delete object with ID ${id}.`, response);
      }
    } else {
        return false;
    }
  }

  async getTasksForAgent(agentId) {
    try {
      const response = await fetch(this.apiUrl, {
        headers: this.headers
      });
      const data = await response.json();
      const tasks = [];
      for (const task of data) {
        if (task.status != 'finished' && task.agentId == agentId) {
          tasks.push(task);
        }
      }
      return tasks;
    } catch (error) {
      console.error(error);
      return false
    }
  }

  async getAgentNames() {
    try {
      const response = await fetch(this.agentUrl, {
        headers: this.headers
      });
      const data = await response.json();
      const agentNamesAndIds = {};
      for (const agent of data) {
        if (agent.status != 'finished') {
          agentNamesAndIds[agent.id] = agent.name;
        }
      }
      return agentNamesAndIds;
    } catch (error) {
      console.error(error);
    }
  }


  async saveAgent(agent) {
    if (this.apiKey) {
      let savedAgent = getDataProperties(agent);
      return this._put(`${this.agentUrl}/${id}`,savedAgent);
    }
  }

  async loadAgent(agentId) {
    if (this.apiKey) {
      const id = agentId;
      return await this._grab(`${this.apiUrl}/${agentId}`);
    }
  }

}

module.exports = PineconeBackend;