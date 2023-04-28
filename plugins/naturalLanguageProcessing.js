// Copyright 2023 Seakaytee, Inc.
//
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

// This module provides a class for representing a natural language processing plugin.

const nlp = require("@tensorflow/tfjs-core");

class NaturalLanguageProcessingPlugin {

  // The version of the plugin.
  version= 1.0;

  // The name of the command.
  command= 'ProcessText';

  // The arguments for the command.
  args= {
    text: 'The text to be processed',
  };

  // This method executes the command.
  async execute(agent, command, task) {
    // Create a tensor from the text.
    const tensor = nlp.Tensor.fromString(command.args.text);

    // Load the model.
    const model = await nlp.load("https://tfhub.dev/tensorflow/bert_en_uncased_L-12_H-768_A-12/1");

    // Predict the classes of the objects in the text.
    const predictions = await model.predict(tensor);

    // Return the predictions.
    return predictions;
  }

}

module.exports = NaturalLanguageProcessingPlugin;
