// Copyright 2023 Seakaytee, Inc.
//
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

// This module provides a class for representing a GitHub clone plugin.

const github = require("@octokit/rest");

class GitHubClonePlugin {

  // The version of the plugin.
  version= 1.0;

  // The name of the command.
  command= 'CloneGithub';

  // The arguments for the command.
  args= {
    repoUrl: 'The URL of the GitHub repository to clone',
    clonePath: 'The path to the directory where the repository will be cloned',
  };

  // This method executes the command.
  async execute(agent, command, task) {
    // Create a GitHub client.
    const client = new github.Client({
      username: process.env.GITHUB_USERNAME || "",
      key: process.env.GITHUB_API_KEY || "",
    });

    // Get the repository.
    const repo = await client.getRepo(command.args.repoUrl);

    // Clone the repository.
    await repo.clone(command.args.clonePath);

    // Log a success message.
    console.log("Repository cloned successfully!");
  }

}

module.exports = GitHubClonePlugin;
