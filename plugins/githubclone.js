// Copyright 2023 Seakaytee, Inc.
//
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

// This module provides a class for representing a GitHub clone plugin.

const Clone = require("git-clone");
const fs = require("fs");

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

  constructor() {

  }

  // This method executes the command.
  async execute(agent, command, task) {
     Clone(command.args.repoUrl,agent.agentManager.workDirName,command.args.options || {},
       (e,r) =>{if (e) {
            return {
                outcome: 'FAILURE',
                text: e,
                results: {
                    error: e,
                },
            };
       } else {
            return {
                outcome: 'SUCCESS'
            }
       }

     });
  }

}

module.exports = GitHubClonePlugin;
