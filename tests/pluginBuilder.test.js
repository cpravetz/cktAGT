// Copyright 2023 Seakaytee, Inc.
//
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

const chai = require('chai');
const expect = chai.expect;
const PluginBuilderPlugin = require('./../plugins/pluginBuilder.js');
const { stubAgent, stubTask } = require('./stubs/stubs.js');

// This is the Mocha test suite.
describe("Plugin Builder Plugin", () => {

  // This test ensures that the plugin can be instantiated.
  it("should be able to be instantiated", () => {
    // Create a new plugin instance.
    const plugin = new PluginBuilderPlugin();

    // Check that the plugin instance is not null.
    expect(plugin).not.to.be.null;
  });

  // This test ensures that the plugin can create a new plugin.
  it("should be able to create a new plugin", async () => {
    // Create a new plugin instance.
    const plugin = new PluginBuilderPlugin();

    // Set the task description.
    const taskDescription = "This plugin will print 'Hello, world!' to the console.";

    // Set the name of the new command.
    const taskCommand = "hello";

    // Create the plugin.
    await plugin.execute(new stubAgent(), {
      args: {
        description: taskDescription,
        newCommand: taskCommand,
      },
    }, new stubTask());

    // Check that the plugin was created successfully.
    expect(fs.existsSync(`./plugins/${taskCommand}+'Plugin'.js`)).to.equal(true);
  });

});
