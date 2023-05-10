// Copyright 2023 Seakaytee, Inc.
//
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

// This module provides a class for representing a GPT-3.5-Turbo model.

const Model = require('./model.js');
const { Configuration, OpenAIApi } = require("openai");

/**
 * A class representing the GPT-3.5-Turbo model.
 */
class GPT35 extends Model {
  /**
   * The OpenAI API configuration.
   */
  configuration;

  /**
   * The OpenAI API instance.
   */
  openAiApiClient;

  /**
   * Default values for max_length and temperature.
   */
  static DEFAULT_MAX_LENGTH = 2000;
  static DEFAULT_TEMPERATURE = 0.7;

  /**
   * The name of the model.
   */
  static name = 'gpt-3.5-turbo';

  constructor() {
    super();

    this.configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY
    });
    this.openAiApiClient = new OpenAIApi(this.configuration);
  }

  /**
   * Generates text using the GPT-3.5-Turbo model.
   * @param {string|string[]} messages - The input messages.
   * @param {object} options - The generation options.
   * @param {number} [options.max_length=2000] - The maximum length of the generated text.
   * @param {number} [options.temperature=0.7] - The temperature of the generation process.
   * @returns {string} The generated text.
   * @throws {TypeError} If the input messages are invalid.
   */
  async generate(messages, options) {
    // Set the max_length and temperature parameters.
    const max_length = options.max_length || GPT35.DEFAULT_MAX_LENGTH;
    const temperature = options.temperature || GPT35.DEFAULT_TEMPERATURE;

    // Check for invalid input type for messages.
    if (!messages || (typeof messages !== 'string' && !Array.isArray(messages))) {
      throw new TypeError('Invalid input type for messages: expected a string or an array of strings.');
    }

    // Format messages.
    const formattedMessages = this.formatMessages(messages);

    try {
      // Generate the text using the GPT-3.5-Turbo model.
      const response = await this.openAiApiClient.createChatCompletion({
        model: this.name,
        messages: formattedMessages,
        temperature: temperature,
        max_tokens: max_length,
      });

      return response.data.choices[0].message.content;
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
}

module.exports = GPT35;

/*    // This is just test data to avoid using tokens
{
  "thoughts": {
    "text": "Revising and editing a manuscript is a complex task that requires a deep understanding of the text, as well as strong writing and editing skills. It is important to be able to identify and correct errors in grammar, spelling, and punctuation. It is also important to be able to improve the clarity, conciseness, and flow of the text.",
    "reasoning": "Revising and editing a manuscript is a long-term process that requires careful attention to detail. It is important to have a clear understanding of the goals of the revision and editing process, and to be able to develop a plan to achieve those goals. It is also important to be able to work effectively with others, such as editors and proofreaders, to ensure that the manuscript is of the highest quality.",
    "actions": [
      "1. Read the manuscript carefully and identify any errors in grammar, spelling, or punctuation.",
      "2. Improve the clarity, conciseness, and flow of the text.",
      "3. Work with an editor or proofreader to ensure that the manuscript is of the highest quality.",
    ],
    "models": [
      "GPT-3",
      "LaMDA",
      "Bard",
    ],
  },
  "commands": [
    {
      "id": 1,
      "name": "ReadFile",
      "action": 1,
      "args": {
        "file_name": "manuscript.txt",
      },
      "model": "GPT-3",
    },
    {
      "id": 2,
      "name": "Think",
      "action": 2,
      "args": {
        "prompt": "How can I improve the clarity, conciseness, and flow of this text?",
      },
      "model": "LaMDA",
    },
    {
      "id": 3,
      "name": "ReadFile",
      "action": 3,
      "args": {
        "file_name": "manuscript_revised.txt",
      },
      "model": "Bard",
    },
  ]
}
             }}]}};
*/