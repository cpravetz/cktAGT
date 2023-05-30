// Copyright 2023 Seakaytee, Inc.
//
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

// This module provides a class for representing a GPT-3.5-Turbo model.

const OpenAI = require('./bases/openai.js');

/**
 * A class representing the GPT-3.5-Turbo model.
 */
class Gorilla extends OpenAI {

  constructor(config = {}) {
    config.apiKey = "EMPTY";
    config.basePath = "http://34.132.127.197:8000/v1";
    
    super(config);

    this.name = 'gorilla';
    this.modelName = 'gorilla-7b-tf-v0';
  }

  
}

module.exports = Gorilla;

