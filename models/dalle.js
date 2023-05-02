// Copyright 2023 Seakaytee, Inc.
//
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

// This module provides a class for representing a DallE model.

const Model = require('./model.js');
const { Configuration, OpenAIApi } = require("openai");

class DallE extends Model {


  // The OpenAI API configuration.
  configuration;

  // The OpenAI API instance.
  LLM;

  constructor(apiKey) {
    super();
    // The name of the model.
    this.name = 'DallE';
    this.configuration = new Configuration({
      apiKey,
    });
    this.LLM = new OpenAIApi(this.configuration);
  }

  generate(prompt, options) {
    // Set the max_width and max_height parameters.
    const max_width = options.max_width || 1024;
    const max_height = options.max_height || 1024;
    const n = options.n || 1;

    // Generate the image using the Dall-E model.
    const response = this.LLM.Image.create({
      prompt,
      n,
      size: `${max_width}x${max_height}`,
    });

    // Return the image.
    return response.data.data[0].url;
  }
}

module.exports = DallE;
