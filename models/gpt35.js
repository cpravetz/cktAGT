// Copyright 2023 Seakaytee, Inc.
//
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

// This module provides a class for representing a GPT-3.5-Turbo model.

const OpenAI = require('./bases/openai.js');

/**
 * A class representing the GPT-3.5-Turbo model.
 */
class GPT35 extends OpenAI {

  constructor() {
    super();
    this.name = 'gpt-3.5-turbo';
  }

  
}

module.exports = GPT35;

