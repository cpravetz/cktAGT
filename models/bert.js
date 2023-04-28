// Copyright 2023 Seakaytee, Inc.
//
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

// This module provides a class for representing a Bert model.

const Model = require('./model.js');
const transformers = require('jstransformer');

class Bert extends Model {

  // The name of the model.
  name = 'bert';

  LLM;

  constructor() {
    super();
    this.LLM = transformers;
  }

  generate(prompt, options) {
    // Set the max_length and temperature parameters.
    const max_length = options.max_length || 100;
    const temperature = options.temperature || 0.7;

    // Generate text using the LLM.
    const text = this.LLM.generate(prompt, {
      max_length,
      temperature,
      do_sample: true,
      no_repeat_ngram_size: 3,
      early_stopping: true,
    });

    // Return the generated text.
    return text;
  }
}

module.exports = Bert;
