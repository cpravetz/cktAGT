// Copyright 2023 Seakaytee, Inc.
//
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

// This module provides a class for representing a GPT-4 model.

const Model = require('./model.js');
const { Configuration, OpenAIApi } = require("openai");

class GPT4 extends Model {

  // The name of the model.
  name = 'gpt-4';

  // The OpenAI API configuration.
  configuration;

  // The OpenAI API instance.
  LLM;

  constructor(apiKey) {
    super();
    this.configuration = new Configuration({
      apiKey,
    });
    this.LLM = new OpenAIApi(this.configuration);
  }

  async generate(prompt, options) {
    // Set the max_length and temperature parameters.
    const max_length = options.max_length || 100;
    const temperature = options.temperature || 0.7;

    // Generate the text using the GPT-4 model.
    const response = await this.LLM.createCompletion({
      prompt,
      max_tokens: max_length,
      temperature,
    });

    // Return the generated text.
    return response.data.text;
  }
}

module.exports = GPT4;