// Copyright 2023 Seakaytee, Inc.
//
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

// This module provides a class for representing a model.

const Strings = require("../../constants/strings.js");
const PluginManager = require("../../managers/pluginManager.js");

class Model {

  // The model name.
  name;

  // The model instance.
  LLM;

  constructor(options = {}) {
    this.name = options.name;
    this.LLM = false;
  }

  // Generate text.
  generate(prompt, options) {
    // Set the max_length and temperature parameters.
    const max_length = options.max_length || 100;
    const temperature = options.temperature || 0.7;

    // Generate the text using the model.
    const text = this.LLM.generate(prompt, {
      max_length,
      temperature,
      do_sample: true,
      no_repeat_ngram_size: 3,
      early_stopping: true,
    });

    // Return the generated text.
    return text;
  }

  // Get the model name.
  getModelName() {
    return this.name;
  }

  
  // Create a full prompt for the given text that is compatible with this mode.
  // This function should be overridden by descendent model interfaces when needed
  compilePrompt(starter, text, constraints, assessments) {

    //takes an array of strings and returns a string with items as a numbered list
    function titledNumberedList(title,list) {
      let tNLresponse = '';
      if (list && list.length > 0) {
        tNLresponse = `
        ${title}
        `;
        for(var i = 0; i < list.length; i++) {
          tNLresponse += `${(i+1).toString()}. ${list[i]}
          `;
        }
      }
      return tNLresponse;
    }


    // Starter is any specific initial string for the prompt
    const response = 
    `${starter}
    ${text}
    ${titledNumberedList('Constraints:', constraints)}
    ${titledNumberedList('Assessments:',assessments)}
    `;
    return response;
  }

  async describePlugins() {
    return await PluginManager.getInstance().describePlugins().replace(/\\"/g,`'`);
  }

  getCache() {
    return false;
  }

  setCache(cache) {
    
  }

}

module.exports = Model;
