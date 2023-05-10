// Copyright 2023 Seakaytee, Inc.
//
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

// This module provides a class for representing a DallE model.

const Model = require('./model.js');
const { Configuration, OpenAIApi } = require("openai");

/**
 * Represents a Dall-E model.
 * @extends Model
 */
class DallE extends Model {
  /**
   * Creates a new Dall-E model instance.
   * @param {string} apiKey - The OpenAI API key.
   */
  constructor(apiKey) {
    super();
    // The name of the model.
    this.name = 'DallE';
    this.configuration = new Configuration({
      apiKey,
    });
    this.openAiApiClient = new OpenAIApi(this.configuration);
  }

  // The OpenAI API configuration.
  configuration;

  // The OpenAI API instance.
  openAiApiClient;

  // Default values for max_width, max_height, and n.
  static DEFAULT_MAX_WIDTH = 1024;
  static DEFAULT_MAX_HEIGHT = 1024;
  static DEFAULT_N = 1;

  /**
   * Generates an image using the Dall-E model.
   * @param {string} prompt - The prompt to generate the image from.
   * @param {Object} options - The generation options.
   * @param {number} [options.max_width=1024] - The maximum width of the generated image.
   * @param {number} [options.max_height=1024] - The maximum height of the generated image.
   * @param {number} [options.n=1] - The number of images to generate.
   * @returns {Promise<string>} The URL of the generated image.
   */
  async generate(prompt, options) {
    // Set the max_width and max_height parameters.
    const max_width = options.max_width && Number.isInteger(options.max_width) ? options.max_width : DallE.DEFAULT_MAX_WIDTH;
    const max_height = options.max_height && Number.isInteger(options.max_height) ? options.max_height : DallE.DEFAULT_MAX_HEIGHT;
    const n = options.n && Number.isInteger(options.n) ? options.n : DallE.DEFAULT_N;

    try {
      // Generate the image using the Dall-E model.
      const response = await this.openAiApiClient.Image.create({
        prompt,
        n,
        size: `${max_width}x${max_height}`,
      });

      // Return the image.
      return response.data.data[0].url;
    } catch (error) {
      console.error(error);
      throw new Error('Failed to generate image');
    }
  }
}

module.exports = DallE;