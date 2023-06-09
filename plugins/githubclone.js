// Copyright 2023 Seakaytee, Inc.
//
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

// This module provides a class for representing a GitHub clone plugin.

const Clone = require("git-clone/promise");
const logger = require('./../constants/logger.js');

class GitHubClonePlugin {

  constructor() {  
  // The version of the plugin.
  this.version = 1.0;

      // The name of the command.
  this.command = 'CloneGithub';
  
  this.description = 'Clones a github repository to working folder so you can use or modify it';
  
      // The arguments for the command.
  this.args = {
        repoUrl: 'URL of the GitHub repository to clone',
        clonePath: 'A path to the folder, relative to our working folder, where the repository will be cloned',
        options: 'An object with any options to be passed to the Clone function'
      };
  

  }

  // This method executes the command.
  async execute(agent, command, task) {
    try {
        await Clone(command.args.repoUrl,agent.agentManager.workDirName,command.args.options || {});   
        logger.debug('githubClone: success');
        return {
            outcome: 'SUCCESS'
        }

    } catch (err) {
        const output = {
            outcome: 'FAILURE',
            text: err,
            results: {
                error: err,
            }
        }
        logger.error({error: output},`githubClone: error ${err.message}`);
        return output;
    }
  }
}

module.exports = GitHubClonePlugin;
