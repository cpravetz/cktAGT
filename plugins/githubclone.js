// Copyright 2023 Seakaytee, Inc.
//
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

// This module provides a class for representing a GitHub clone plugin.

const Clone = require("git-clone");
const fs = require("fs");

class GitHubClonePlugin {

  constructor() {
    // The version of the plugin.
    this.version= 1.0;

    // The name of the command.
    this.command= 'CloneGithub';

    this.description = 'Clones a github repository to working folder so you can use or modify it';

    // The arguments for the command.
    this.args= {
      repoUrl: 'The URL of the GitHub repository to clone',
      clonePath: 'The path to the directory where the repository will be cloned',
    };
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
