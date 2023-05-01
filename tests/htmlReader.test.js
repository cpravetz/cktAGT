// Copyright 2023 Seakaytee, Inc.
//
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

const chai = require('chai');
const expect = chai.expect;
const HTMLReaderPlugin = require('./../plugins/htmlReader.js');
const { stubAgent, stubTask } = require('./stubs/stubs.js');

// This is the Mocha test suite.
describe("HTML Reader Plugin", () => {

  // This test ensures that the plugin can be instantiated.
  it("should be able to be instantiated", () => {
    // Create a new plugin instance.
    const plugin = new HTMLReaderPlugin();

    // Check that the plugin instance is not null.
    expect(plugin).not.to.be.null;
  });

  // This test ensures that the plugin can read an HTML document from a URL.
  it("should be able to read an HTML document from a URL", async () => {
    // Create a new plugin instance.
    const plugin = new HTMLReaderPlugin();

    // Set the URL of the web page to read.
    const url = "https://www.google.com";

    // Read the web page.
    const result = await plugin.execute(new stubAgent(), {
      args: {
        url,
      },
    }, new stubTask());

    // Check that the web page was read successfully.
    expect(result.outcome).to.equal("SUCCESS");

    // Check that the web page contains the expected text.
    expect(result.results.file).toContain("Google");
  });

});
