// Copyright 2023 Seakaytee, Inc.
//
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

const chai = require('chai');
const expect = chai.expect;
const GPT35 = require('./../models/gpt35.js');

describe("GPT-3.5-Turbo Model", () => {

  // This test ensures that the model can be instantiated.
  it("should be able to be instantiated", () => {
    // Create a new model instance.
    const model = new GPT35("YOUR_API_KEY");

    // Check that the model instance is not null.
    expect(model).not.to.be.null;
  });

  // This test ensures that the model can generate text.
  it("should be able to generate text", async () => {
    // Create a new model instance.
    const model = new GPT35("YOUR_API_KEY");

    // Set the prompt.
    const prompt = "What is your name?";

    // Set the options.
    const options = {
      temperature: 0.7,
      max_tokens: 100,
    };

    // Generate the text.
    const response = await model.generate(prompt, options);

    // Check that the response is not null.
    expect(response).not.to.be.null;

    // Check that the response is not empty.
    expect(response.length).to.equalGreaterThan(0);

    // Check that the response is valid text.
    expect(response).toMatch(/^[a-zA-Z ]+$/);
  });

});
