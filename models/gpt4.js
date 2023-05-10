// Copyright 2023 Seakaytee, Inc.
//
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

// This module provides a class for representing a GPT-4 model.

const Model = require('./model.js');
const { Configuration, OpenAIApi } = require("openai");

class GPT4 extends Model {

  // The OpenAI API configuration.
  configuration;

  // The OpenAI API instance.
  openAiApiClient;

  // The name of the model.
  static name = 'gpt-4';

  constructor() {
    super();
    this.configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY
    });
    this.openAiApiClient = new OpenAIApi(this.configuration);
  }

  async generate(prompt, options) {
    // Validate input parameters
    const max_length = typeof options.max_length === 'number' && options.max_length > 0 ? options.max_length : 100;
    const temperature = typeof options.temperature === 'number' && options.temperature >= 0 && options.temperature <= 1 ? options.temperature : 0.7;

    // Add error handling for the API call
    let response;
    try {
      response = await this.openAiApiClient.createCompletion({
        prompt,
        max_tokens: max_length,
        temperature,
      });
    } catch (error) {
      console.error(error);
      return null;
    }

    // Return the full message
    return response.data.choices[0].message.content;
  }
}

module.exports = GPT4;