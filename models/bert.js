// Copyright 2023 Seakaytee, Inc.
//
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

// This module provides a class for representing a Bert model.

const Model = require('./model.js');
const transformers = require('@xenova/transformers');

class Bert extends Model {

  constructor() {
    super();
    // The name of the model.
    this.name = 'bert';
    // Load the BERT tokenizer and model.
    this.tokenizer = transformers.BertTokenizer.from_pretrained('bert-base-uncased');
    this.model = transformers.TFBertModel.from_pretrained('bert-base-uncased');
  }

  generate(prompt, options) {
    // Set the max_length and temperature parameters.
    const max_length = options.max_length || 100;
    const temperature = options.temperature || 0.7;

    // Encode the prompt text.
    const input_ids = this.tokenizer(prompt, return_tensors='tf')['input_ids'];

    // Get the output of the BERT model.
    const output = this.model(input_ids);

    // Generate text using the LLM.
    const text = this.tokenizer.decode(output[0], max_length=max_length, temperature=temperature, do_sample=true, no_repeat_ngram_size=3, early_stopping=true);

    // Return the generated text.
    return text;
  }
}

module.exports = Bert;
