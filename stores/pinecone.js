// Copyright 2023 Seakaytee, Inc.
//
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

// This module provides a class for representing a Pinecone backend.

class PineconeBackend {

  constructor(apiKey, indexName) {
    this.apiKey = process.env.PINECONE_API_KEY || false;
    this.indexName = 'cktAgtTasks';
    this.apiUrl = `https://api.pinecone.io/v1/indexes/${this.indexName}/objects`;
    this.headers = {
      'Authorization': `API-Key ${this.apiKey}`,
      'Content-Type': 'application/json'
    };
  }

  async save(obj) {
    if (this.apiKey) {
      const id = obj.id;
      const body = JSON.stringify(obj);

      const response = await fetch(`${this.apiUrl}/${id}`, {
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
    } else {
      return false;
    }
  }

  async load(obj) {
    if (this.apiKey) {
      const id = obj.id;

      const response = await fetch(`${this.apiUrl}/${id}`, {
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
    } else {
        console.error('Call to Pinecone when not initialized.');
        return false;
    }
  }

  async delete(obj) {
    if (this.apiKey) {
      const id = obj.id;

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
}

module.exports = PineconeBackend;