// Copyright 2023 Seakaytee, Inc.
//
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

// This module provides a class for representing an HTML reader plugin.

const hfi = require("@huggingface/inference");
const fetch =  require('node-fetch');
const logger = require('./../constants/logger.js');

class HuggingfacePlugin {


  constructor(token = process.env.HUGGINGFACE_TOKEN) {  
    this.version = 1.0;

    this.command = "huggingface";
  
    this.description = "Send a prompt to Huggingface and return a transformation() response";
  
    this.args = {
      inputs: {
        description: "The prompt or other inputs for the transformation",
        type: "string, array or object appropriate for the transformation function used",
      },
      model: {
        description: "The Huggingface model to use",
        type: "string",
      },
      transformation: {
        description: "The transformation to use from @huggingface/inference HfInference class",
        type: "string",
      },
    };
  
    this.token = token;
  }

  async execute(agent, command, task) {
    const inputs = command.args.inputs;
    const model = command.args.model;
    const transformation = command.args.transformation;

    try {
      // Create a Huggingface client
      const client = new hfi.HfInference(this.token);

      // Send the prompt to the model
      const response = await client[transformation]({model:model, inputs:inputs}, {fetch:fetch});

      // Return the response
      const output = {
        outcome: "SUCCESS",
        text: response,
        results: {},
        tasks: [],
      };
      logger.debug({output:output},'huggingFace: execute results');
      return output;
    } catch (err) {
      // Return an error
      const output = {
        outcome: "FAILURE",
        text: err.message,
        results: {error:err},
        tasks: [],
      };
      logger.error({output:output},`huggingFace: execute error ${err.message}`);
      return output;
    }
  }
}

module.exports = HuggingfacePlugin;
