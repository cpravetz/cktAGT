// Copyright 2023 Seakaytee, Inc.
//
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

// This module provides a class for representing a Pinecone backend.
const replaceObjectReferencesWithIds = require('./../constants/utils.js');
const fetch =  require('node-fetch');

class PineconeBackend {

  constructor() {
    const apiKey = process.env.PINECONE_API_KEY || false;
    this.indexName = 'cktAgtTasks';
    this.apiUrl = `https://api.pinecone.io/v1/indexes/cktAgtTasks/objects`;
    this.headers = {
      'Authorization': `API-Key ${apiKey}`,
      'Content-Type': 'application/json'
    };
    this.agentIndexName = 'cktAgents';
    this.agentUrl = `https://api.pinecone.io/v1/indexes/cktAgents/objects`;
  }


  async _grab(url) {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.headers
      });

      if (response.ok) {
        const result = await response.json();
        return result;
      } else {
        return null;
      }
  }

  async _put(url, obj) {
    const body = JSON.stringify(obj);

    const response = await fetch(url, {
         method: 'PUT',
         headers: this.headers,
         body: body
    });

    if (response.ok) {
      const result = await response.json();
      return result;
    } else {
      console.error(`Failed to save object with ID ${obj.id}.`, response);
    }
  }

  async save(task) {
    if (this.apiKey) {
      let savedTask = replaceObjectReferencesWithIds(task);
      return this._put(`${this.apiUrl}/${task.id}`,savedTask);
    }
  }

  async load(taskId) {
    if (this.apiKey) {
      return await this._grab(`${this.apiUrl}/${taskId}`);
    }
  }

  async delete(taskId) {
    if (this.apiKey) {
      const response = await fetch(`${this.apiUrl}/${taskId}`, {
        method: 'DELETE',
        headers: this.headers
      });

      if (!response.ok) {
        console.error(`Failed to delete object with ID ${taskId}.`, response);
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
      let savedAgent = replaceObjectReferencesWithIds(agent);
      return this._put(`${this.agentUrl}/${agent.id}`,savedAgent);
    }
  }

  async loadAgent(agentId) {
    if (this.apiKey) {
      return await this._grab(`${this.apiUrl}/${agentId}`);
    }
  }

}

module.exports = PineconeBackend;