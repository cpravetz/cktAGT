
// Copyright 2023 Seakaytee, Inc.
//
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

const chai = require('chai');
const expect = chai.expect;
const FileWriterPlugin = require('./../plugins/fileWriter.js');
const { stubAgent, stubTask } = require('./stubs/stubs.js');
const fs = require("fs");

// This is the Mocha test suite.
describe("File Writer Plugin", () => {

  // This test ensures that the plugin can be instantiated.
  it("should be able to be instantiated", () => {
    // Create a new plugin instance.
    const plugin = new FileWriterPlugin();

    // Check that the plugin instance is not null.
    expect(plugin).not.to.be.null;
  });

  // This test ensures that the plugin can write a file to disk.
  it("should be able to write a file to disk", async () => {
    // Create a new plugin instance.
    const plugin = new FileWriterPlugin();

    // Set the file name and content.
    const fileName = "test.txt";
    const content = "This is some test content.";

    // Write the file.
    const result = await plugin.execute(new stubAgent(), {
      args: {
        fileName,
        content,
        overwrite: true,
      },
    }, new stubTask());

    // Check that the file was written successfully.
    expect(result.outcome).to.equal("SUCCESS");

    // Check that the file contains the expected content.
    const fileContent = await fs.readFileSync(fileName, "utf8");
    expect(fileContent).to.equal(content);
  });

  // This test ensures that the plugin fails to write a file to disk if the file already exists and overwrite is false.
  it("should fail to write a file to disk if the file already exists and overwrite is false", async () => {
    // Create a new plugin instance.
    const plugin = new FileWriterPlugin();

    // Set the file name and content.
    const fileName = "test.txt";
    const content = "This is some test content.";

    // Write the file.
    const result = await plugin.execute(new stubAgent(), {
      args: {
        fileName,
        content,
        overwrite: false,
      },
    }, new stubTask());

    // Check that the file was not written successfully.
    expect(result.outcome).to.equal("FAILURE");
  });

});
