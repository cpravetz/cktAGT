// Copyright 2023 Seakaytee, Inc.
//
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

// This module provides a class for representing a GPT-3.5-Turbo model.

const Model = require('./model.js');
const { Configuration, OpenAIApi } = require("openai");

class GPT35 extends Model {


  // The OpenAI API configuration.
  configuration;

  // The OpenAI API instance.
  LLM;

  constructor(apiKey) {
    super();
    // The name of the model.
    this.name = 'gpt-3.5-turbo';

    this.configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY
    });
    this.LLM = new OpenAIApi(this.configuration);
  }

  async generate(messages, options) {
    // Set the max_length and temperature parameters.
    const max_length = options.max_length || 100;
    const temperature = options.temperature || 0.7;

    let msgs = [];
    if (typeof(messages === String)) {
        msgs.push({role: 'user', content: messages});
    } else {
        for (var i = 0; i < messages.length; i++) {
            msgs.push({role: 'user', content: messages[i]});
        }
    }


    // Generate the text using the GPT-3.5-Turbo model.
    const response = await this.LLM.createChatCompletion({
      model: this.name,
      messages: msgs,
      temperature: temperature,
      max_tokens: max_length,
    });

    // Return the full message
    response.data.choices[0].text = response.data.choices[0].message.content;
    return response;
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