// Copyright 2023 Seakaytee, Inc.
//
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

// This module provides a class for representing a GPT-3.5-Turbo model.

const Model = require('./model.js');
const { Configuration, OpenAIApi } = require("openai");

/**
 * A class representing the GPT-4 model.
 */
class OpenAI extends Model {
  /**
   * The OpenAI API configuration.
   */
  configuration;

  /**
   * The OpenAI API instance.
   */
  openAiApiClient;

  /**
   * The Conversation Cache
   */
  cache;

  constructor() {
    super();
    /**
     * Default values for max_length and temperature.
     */
    this.DEFAULT_MAX_LENGTH = Number(process.env.LLM_MAX_TOKENS) ||2000;
    this.DEFAULT_TEMPERATURE = Number(process.env.LLM_TEMPERATURE) || 0.7;
    this.cache = [];
    this.chatLength = Number(process.env.LLM_CHAT_LENGTH) || 5;
    /**
     * The name of the model.
     */
    this.name = '';

    this.configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY
    });
    this.openAiApiClient = new OpenAIApi(this.configuration);
  }

  /**
   * Generates text using the GPT-4 model.
   * @param {string|string[]} messages - The input messages.
   * @param {object} options - The generation options.
   * @param {number} [options.max_length=2000] - The maximum length of the generated text.
   * @param {number} [options.temperature=0.7] - The temperature of the generation process.
   * @returns {string} The generated text.
   * @throws {TypeError} If the input messages are invalid.
   */
  async generate(messages, options) {
    // Set the max_length and temperature parameters.
    const max_length = options.max_length || this.DEFAULT_MAX_LENGTH;
    const temperature = options.temperature || this.DEFAULT_TEMPERATURE;

    // Check for invalid input type for messages.
    if (!messages || (typeof messages !== 'string' && !Array.isArray(messages))) {
      throw new TypeError('Invalid input type for messages: expected a string or an array of strings.');
    }

    // Format messages.
    const formattedMessages = this.formatMessages(messages);
    this.cache = this.cache.concat(formattedMessages);
    const conversation = (this.cache.length <= this.chatLength) ? this.cache : this.cache.slice(this.cache.length - this.chatLength);
    try {
      // Generate the text using the GPT-4 model.
      const response = await this.openAiApiClient.createChatCompletion({
        model: this.name,
        messages: conversation,
        temperature: temperature,
        max_tokens: max_length,
      });
      const textReply = response.data.choices[0].message.content || '';
      this.cache.push({role:'assistant', content: this.extractValue(textReply,'thoughts')});
      return textReply;
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Formats the input messages.
   * @param {string|string[]} messages - The input messages.
   * @returns {object[]} The formatted messages.
   */
  formatMessages(messages) {
    let formattedMessages = [];
    if (typeof messages === 'string') {
      formattedMessages.push({ role: 'user', content: messages });
    } else {
      for (const message of messages) {
        formattedMessages.push({ role: 'user', content: message });
      }
    }
    return formattedMessages;
  }

  extractValue(json, key) {
    try {
      const value = JSON.stringify(JSON.parse(json)[key]);
      return value;
    }
    catch (error) {
      return json;
    }
  }


  getCache() {
    return this.cache;
  }

  setCache(cache) {
    if (Array.isArray(cache)) {
      this.cache = cache;
    }
  }

}

module.exports = OpenAI;
