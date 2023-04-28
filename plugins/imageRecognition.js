// Copyright 2023 Seakaytee, Inc.
//
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

// This module provides a class for representing an image recognition plugin.

const vision = require("@tensorflow/tfjs-core");

class ImageRecognitionPlugin {

  // The version of the plugin.
  version= 1.0;

  // The name of the command.
  command= 'RecognizeImage';

  // The arguments for the command.
  args= {
    image: 'The image to be recognized',
  };

  // This method executes the command.
  async execute(agent, command, task) {
    // Create a tensor from the image.
    const tensor = vision.Tensor.fromImage(command.args.image);

    // Load the model.
    const model = await vision.load("https://tfhub.dev/tensorflow/resnet50/classification/1");

    // Predict the classes of the objects in the image.
    const predictions = await model.predict(tensor);

    // Return the predictions.
    return predictions;
  }
}

module.exports = ImageRecognitionPlugin;
