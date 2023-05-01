// Copyright 2023 Seakaytee, Inc.
//
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

const chai = require('chai');
const expect = chai.expect;
const GitHubClonePlugin = require('./../plugins/githubclone.js');
const { stubAgent, stubTask } = require('./stubs/stubs.js');
const fs = require("fs");

// This is the Mocha test suite.
describe("GitHub Clone Plugin", () => {

  // This test ensures that the plugin can be instantiated.
  it("should be able to be instantiated", () => {
    // Create a new plugin instance.
    const plugin = new GitHubClonePlugin();

    // Check that the plugin instance is not null.
    expect(plugin).not.to.be.null;
  });

  // This test ensures that the plugin can clone a GitHub repository.
  it("should be able to clone a GitHub repository", async () => {
    // Create a new plugin instance.
    const plugin = new GitHubClonePlugin();

    // Set the repository URL and clone path.
    const repoUrl = "https://github.com/bard/bard";
    const clonePath = "bard";

    // Clone the repository.
    await plugin.execute(new stubAgent(), {
      args: {
        repoUrl: repoUrl,
        clonePath: clonePath,
      },
    }, new stubTask());

    // Check that the repository was cloned successfully.
    expect(fs.existsSync(clonePath)).to.equal(true);
  });

});
