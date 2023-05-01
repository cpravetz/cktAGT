// Copyright 2023 Seakaytee, Inc.
//
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

const chai = require('chai');
const expect = chai.expect;
const ImageRecognitionPlugin = require('./../plugins/imageRecognition.js');
const { stubAgent, stubTask } = require('./stubs/stubs.js');

// This is the Mocha test suite.
describe("Image Recognition Plugin", () => {

  // This test ensures that the plugin can be instantiated.
  it("should be able to be instantiated", () => {
    // Create a new plugin instance.
    const plugin = new ImageRecognitionPlugin();

    // Check that the plugin instance is not null.
    expect(plugin).not.to.be.null;
  });

  // This test ensures that the plugin can recognize an image.
  it("should be able to recognize an image", async () => {
    // Create a new plugin instance.
    const plugin = new ImageRecognitionPlugin();

    // Set the path to the image to be recognized.
    const imagePath = "./test.jpg";

    // Recognize the image.
    const predictions = await plugin.execute(new stubAgent(), {
      args: {
        image: imagePath,
      },
    }, new stubTask());

    // Check that the plugin was able to recognize the image.
    expect(predictions).not.to.be.null;

    // Check that the plugin was able to recognize the correct object in the image.
    expect(predictions[0].label).to.equal("cat");
  });

});
