// Copyright 2023 Seakaytee, Inc.
//
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

const chai = require('chai');
const expect = chai.expect;
const DallE = require('./../models/dalle.js');

// This is the Mocha test suite.
describe("DallE Model", () => {

  // This test ensures that the model can be instantiated.
  it("should be able to be instantiated", () => {
    // Create a new model instance.
    const model = new DallE("YOUR_API_KEY");

    // Check that the model instance is not null.
    expect(model).not.to.be.null;
  });

  // This test ensures that the model can generate an image.
  it("should be able to generate an image", async () => {
    // Create a new model instance.
    const model = new DallE("YOUR_API_KEY");

    // Set the prompt.
    const prompt = "A cat sitting on a chair";

    // Set the options.
    const options = {
      max_width: 1024,
      max_height: 1024,
    };

    // Generate the image.
    const response = await model.generate(prompt, options);

    // Check that the response is not null.
    expect(response).not.to.be.null;

    // Check that the response is an image URL.
    expect(response).toMatch(/^https?:\/\/.*\.(jpg|jpeg|png|gif)$/);

    // Save the image to disk.
    const image = await fetch(response);
    const buffer = await image.arrayBuffer();
    const imageFile = new File([buffer], "cat-sitting-on-chair.png");
    await imageFile.save(".");
  });

});
