// Copyright 2023 Seakaytee, Inc.
//
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

// This module provides a class for representing a Bard model.

const Model = require('./model.js');

/**
 * Represents a Bard model.
 */
class Bard extends Model {

  /**
   * The name of the model.
   * @type {string}
   */
  static name = 'bard';
  /**
   * The base URL for the Bard API.
   * @type {string}
   */
  static url = 'https://bard.google.com/v1/generate';


  /**
   * Creates a new Bard instance.
   */
  constructor() {
    super();
  }

  /**
   * Generates a new message using the Bard API.
   * @param {string[]} messages - The input messages to use.
   * @param {Object} options - The options to use.
   * @returns {Promise<string>} - The generated message.
   * @throws {Error} - If the input parameters are invalid or the network request fails.
   */
  async generate(messages, options) {
    this.validateInput(messages, options);
    const request = new Request(this.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        options,
      }),
    });

    try {
      const response = await fetch(request);
      if (!response.ok) {
        throw new Error(`Failed to generate message: ${response.status} ${response.statusText}`);
      }
      return response.text();
    } catch (error) {
      console.error(error);
      throw new Error('Failed to generate message: network error');
    }
  }

  /**
   * Validates the input parameters for the `generate` method.
   * @param {string[]} messages - The input messages to validate.
   * @param {Object} options - The options to validate.
   * @throws {Error} - If the input parameters are invalid.
   */
  validateInput(messages, options) {
    if (!Array.isArray(messages) || messages.length === 0) {
      throw new Error('Invalid input: messages must be a non-empty array');
    }
    if (typeof options !== 'object' || options === null) {
      throw new Error('Invalid input: options must be an object');
    }
  }
}

module.exports = Bard;