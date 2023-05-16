// Copyright 2023 Seakaytee, Inc.
//
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

// This module provides a class for generating new images with DallE.

const { Configuration, OpenAIApi } = require("openai");
const fs = require('fs');

class ImageCreatorPlugin {

  constructor() {  
    // The version of the plugin.
    this.version = 1.0;

    // The name of the command.
    this.command = 'CreateImage';

    this.description = 'Uses the DallE model to create a new image';

    // The arguments for the command.
    this.args = {
      prompt: 'The description of the image to be created.',
      max_size: 'Maximum iamge size, either "256x256", "512x512" or "1024x1024"',
      max_height: 'Maximum height of generated image',
      n: 'The number of images to create',
    };
  }
  // Default values for max_width, max_height, and n.
  static DEFAULT_MAX_SIZE = '1024x1024';
  static DEFAULT_N = 1;


  async saveImageFile(url, agent) {
    const fs = require("fs");
  
    const image = await fetch(url);
    const blob = await image.blob();
    const filename = url.split("/").pop();
  
    const path = `${agent.agentManager.workDirName}/${filename}`;
    fs.writeFileSync(path, blob);
    this.filelist.push(path);
  }
  
  // This method executes the command.
  async execute(agent, command, task) {
    let output = {};
    if (!process.env.OPENAI_API_KEY) {
        return {outcome: 'FAILURE', text: 'No API key for OpenAI'}
    }
    this.openAiApiClient = new OpenAIApi(process.env.OPENAI_API_KEY);
    // Set the max_width and max_height parameters.
    const max_size =  command.args.max_size || ImageCreatorPlugin.DEFAULT_MAX_SIZE;
    const n = (command.args.n && Number.isInteger(command.args.n)) ? command.args.n : DallE.DEFAULT_N;

    try {
      // Generate the image using the Dall-E model.
      const response = await this.openAiApiClient.createImage({
        prompt:prompt,
        n:n,
        size: max_size,
      });

      this.filelist = [];

      response.data.forEach(async (url) => {
        await this.saveImageFile(url, agent);
      });

      output.results = {urls: response.data, files: this.filelist}
    } catch (error) {
        output.outcome = 'FAILURE';
        outcome.results = {error: `Failed to generate image ${error}`}
    }
    return output;
  }  
  
}

module.exports = ImageCreatorPlugin;
