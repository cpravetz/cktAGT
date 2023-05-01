// Copyright 2023 Seakaytee, Inc.
//
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

const chai = require('chai');
const expect = chai.expect;
const FileReaderPlugin = require('./../plugins/fileReader.js');
const { stubAgent, stubTask } = require('./stubs/stubs.js');
const fs = require("fs");
const Task = require('./../managers/task.js');

// This is the Mocha test suite.
describe("File Reader Plugin", () => {

  // This test ensures that the plugin can be instantiated.
  it("should be able to be instantiated", () => {
    // Create a new plugin instance.
    const plugin = new FileReaderPlugin();

    // Check that the plugin instance is not null.
    expect(plugin).not.to.be.null;
  });

  // This test ensures that the plugin can read a file from disk.
  it("should be able to read a file from disk", async () => {
    // Create a new plugin instance.
    const plugin = new FileReaderPlugin();

    // Set the file name and content.
    const fileName = "test.txt";
    const content = "This is some test content.";

    // Write the file.
    await fs.writeFileSync(fileName, content, "utf8");

    // Read the file.
    const result = await plugin.execute(new stubAgent(), {
      args: {
        fileName,
      },
    }, new stubTask());

    // Check that the file was read successfully.
    expect(result.outcome).to.equal("SUCCESS");

    // Check that the file contains the expected content.
    expect(result.results.file).to.equal(content);
  });

  // This test ensures that the plugin fails to read a file from disk if the file does not exist.
  it("should fail to read a file from disk if the file does not exist", async () => {
    // Create a new plugin instance.
    const plugin = new FileReaderPlugin();

    // Set the file name.
    const fileName = "test.txt";

    // Read the file.
    const result = await plugin.execute(new stubAgent(), {
      args: {
        fileName,
      },
    }, new stubTask());

    // Check that the file was not read successfully.
    expect(result.outcome).to.equal("FAILURE");
  });

});
