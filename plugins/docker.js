// Copyright 2023 Seakaytee, Inc.
//
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

// This module provides a class for representing a database plugin.

const docker = require("docker");
const logger = require('./../constants/logger.js');

class DockerPlugin {

  constructor() {  
    this.version = 1.0;
    this.command = "docker";
    this.description = "Interact with Docker containers";
    this.args = {
      image: {
        description: "The name of the Docker image to use",
        type: "string",
      },
      command: {
        description: "The command to run inside the Docker container",
        type: "string",
      },
      args: {
        description: "The arguments to pass to the command",
        type: "array",
      },
    };
  
  
  }

  execute(agent, command, task) {
    const image = command.args.image;
    const thisCommand = command.args.command;
    const args = command.args.args;

    try {
      // Create a new Docker client
      const client = new docker.Docker();

      // Create a new container
      const container = client.createContainer({
        image,
        thisCommand,
        args,
      });

      // Start the container
      container.start();

      // Wait for the container to finish
      container.wait();

      // Get the container's logs
      const logs = container.logs();

      const output = {
        outcome: "SUCCESS",
        text: logs,
        results: {},
        tasks: [],
      };
      logger.debug({output:output},'docker: execute result');
      // Return the results
      return output;
    } catch (err) {
      // Return an error
      logger.error({error:err},`docker: error ${err.message}`);
      return {
        outcome: "FAILURE",
        text: err.message,
        results: {error:err},
        tasks: [],
      };
    }
  }
}

module.exports = DockerPlugin;
