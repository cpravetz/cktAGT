// Copyright 2023 Seakaytee, Inc.
//
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

const chai = require('chai');
const expect = chai.expect;
const InternetSearchPlugin = require('./../plugins/internetSearch.js');
const { stubAgent, stubTask } = require('./stubs/stubs.js');

// This is the Mocha test suite.
describe("Internet Search Plugin", () => {

  // This test ensures that the plugin can be instantiated.
  it("should be able to be instantiated", () => {
    // Create a new plugin instance.
    const plugin = new InternetSearchPlugin();

    // Check that the plugin instance is not null.
    expect(plugin).not.to.be.null;
  });

  // This test ensures that the plugin can search the internet.
  it("should be able to search the internet", async () => {
    // Create a new plugin instance.
    const plugin = new InternetSearchPlugin();
    // Set the search term.
    const searchTerm = "Bard";

    // Search for the term.
    const results = await plugin.execute(new stubAgent(), {
      args: {
        find: searchTerm,
      },
    }, new stubTask());

    // Check that the plugin was able to search the internet.
    expect(results).not.to.be.null;

    // Check that the plugin was able to find at least one result.
    expect(results.items.length).to.equalGreaterThanOrEqual(1);
  });

});
