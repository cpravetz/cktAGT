// Copyright 2023 Seakaytee, Inc.
//
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

const chai = require('chai');
const expect = chai.expect;
const Bard = require('./../models/bard.js');

// This is the Mocha test suite.
describe("Bard Model", () => {

  // This test ensures that the model can be instantiated.
  it("should be able to be instantiated", () => {
    // Create a new model instance.
    const model = new Bard();

    // Check that the model instance is not null.
    expect(model).not.to.be.null;
  });

  // This test ensures that the model can generate text.
  it("should be able to generate text", async () => {
    // Create a new model instance.
    const model = new Bard();

    // Set the messages.
    const messages = [
      "What is your name?",
      "I am Bard.",
      "What can you do?",
      "I can generate text, translate languages, write different kinds of creative content, and answer your questions in an informative way.",
    ];

    // Set the options.
    const options = {
      temperature: 0.7,
      max_tokens: 100,
    };

    // Generate the text.
    const responses = await model.generate(messages, options);

    // Check that the responses are not null.
    expect(responses).not.to.be.null;

    // Check that the responses are not empty.
    expect(responses.length).toBeGreaterThan(0);

    // Check that the responses are valid text.
    expect(responses[0]).toMatch(/^[a-zA-Z ]+$/);
  });

});
