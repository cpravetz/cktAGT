// Copyright 2023 Seakaytee, Inc.
//
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

// This module provides a class for representing an image recognition plugin.

const hfi = require("@huggingface/inference");
const fs = require("fs");
const fetch =  require('node-fetch');
const logger = require('./../constants/logger.js');

class ImageRecognitionPlugin {

  constructor() {  
    // The version of the plugin.
    this.version = 1.0;

    // The name of the command.
    this.command = 'RecognizeImage';

    this.description = 'Gets a textual description of an image';

    // The arguments for the command.
    this.args = {
      image: 'If no url, the binary image to be recognized, not a url',
      url: 'if no image, the url for the file'
    };

    this.hfiClient = false;
  }

  async loadImagefromUrl(url)  {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw response.statusText;
      }
    return await response.arrayBuffer();
    } catch (err) {
      logger.error({error:err, url:url, fetchResponse: response},'Error in loadImagefromUrl');
      throw err;
    }
  }

  // This method executes the command.
  async execute(agent, command, task) {
   const output = {outcome: 'SUCCESS'};
   try{
     if (command.args.url) {
      this.image = await this.loadImagefromUrl(command.args.url)
     } else {
      this.image = command.args.image
     }

     if (!this.hfiClient) {
      this.hfiClient = new hfi.HfInference(process.env.HUGGINGFACE_TOKEN || undefined );
     }
     const model = 'nlpconnect/vit-gpt2-image-captioning';
     const {generated_text} = await this.hfiClient.imageToText({model:model, data: this.image},{fetch: fetch});
     output.results = {text: generated_text};
     output.text = generated_text;   
   } catch (err) {
     output.outcome = 'FAILURE';
     output.text = err.message;
     output.results = {error: err};
     logger.error({error:err, text:generated_text},'Error in imageRecognition generate');
  } finally {
    return output;
  }  
  }
}

module.exports = ImageRecognitionPlugin;
