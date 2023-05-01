// Copyright 2023 Seakaytee, Inc.
//
// Licensed under the MIT License. See LICENSE file in the project root for full license information.
const { stubAgent, stubTask } = require('./stubs/stubs.js');

const chai = require('chai');
const expect = chai.expect;
const UserInputPlugin = require('./../plugins/userinput.js');

// This is the Mocha test suite.
describe("User Input Plugin", () => {

  // This test ensures that the plugin can be instantiated.
  it("should be able to be instantiated", () => {
    // Create a new plugin instance.
    const plugin = new UserInputPlugin();

    // Check that the plugin instance is not null.
    expect(plugin).not.to.be.null;
  });

  // This test ensures that the plugin can ask the user for input.
  it("should be able to ask the user for input", async () => {
    // Create a new plugin instance.
    const plugin = new UserInputPlugin();

    // Set the prompt.
    const prompt = "What is your name?";

    // Set the choices.
    const choices = ["Manny", "Moe", "Jack"];

    // Set the required flag.
    const required = true;

    // Ask the user for input.
    const response = await plugin.execute(new stubAgent(), {
      args: {
        prompt,
        choices,
        required,
      },
    }, new stubTask());

    // Check that the user input was received successfully.
    expect(response).not.to.be.null;
    expect(response).to.equal("Manny");
  });

});
