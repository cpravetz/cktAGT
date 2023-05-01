// Copyright 2023 Seakaytee, Inc.
//
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

const chai = require('chai');
const expect = chai.expect;
const NaturalLanguageProcessingPlugin = require('./../plugins/naturalLanguageProcessing.js');
const { stubAgent, stubTask } = require('./stubs/stubs.js');

// This is the Mocha test suite.
describe("Natural Language Processing Plugin", () => {

  // This test ensures that the plugin can be instantiated.
  it("should be able to be instantiated", () => {
    // Create a new plugin instance.
    const plugin = new NaturalLanguageProcessingPlugin();

    // Check that the plugin instance is not null.
    expect(plugin).not.to.be.null;
  });

  // This test ensures that the plugin can process text.
  it("should be able to process text", async () => {
    // Create a new plugin instance.
    const plugin = new NaturalLanguageProcessingPlugin();

    // Set the text to be processed.
    const text = "This is a sentence.";

    // Process the text.
    const predictions = await plugin.execute(new stubAgent(), {
      args: {
        text: text,
      },
    }, new stubTask());

    // Check that the plugin was able to process the text.
    expect(predictions).not.to.be.null;

    // Check that the plugin was able to predict the correct classes for the objects in the text.
    expect(predictions[0].label).to.equal("sentence");
  });

});
