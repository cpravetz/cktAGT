// Copyright 2023 Seakaytee, Inc.
//
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

// This module provides a class for representing a GPT-4 model.

const OpenAI = require('./bases/openai.js');

/**
 * A class representing the GPT-4 model.
 */
class GPT4 extends OpenAI {

  constructor() {
    super();
    this.name = 'gpt-4';
    this.modelName = 'gpt-4';
  }

}

module.exports = GPT4;
