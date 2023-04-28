// Copyright 2023 Seakaytee, Inc.
//
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

const fs = require("fs");
const path = require("path");
const Strings = require("../constants/strings.js");

// This is the ModelManager class.
class ModelManager {

  // This is a dictionary of available models.
  models = {}  //{ [key: string]: any } = {};

  //The activeModel is the default model identified in environment variables.
  //This one gets the initial task for a new agent, and other tasks not assigned a specific model
  activeModel;

  // This constructor initializes the model manager.
  constructor() {
    this.loadModels();
    this.activeModel = this.getModel(process.env.DEFAULT_MODEL || Strings.defaultModel);
  }

  // This method loads the models from the `models` directory.
  loadModels() {
    const modelsDir = "./models";
    for (const file of fs.readdirSync(modelsDir)) {
      const modelPath = path.join(modelsDir, file);
      if (fs.statSync(modelPath).isFile() && modelPath.endsWith(".js")) {
        const model = require(`../${modelPath}`);
        this.models[model.name] = new model();
      }
    }
  }

  // This method gets a model by name.
  getModel(name)  {
    return this.models[name] || false;
  }
}

module.exports = ModelManager;
