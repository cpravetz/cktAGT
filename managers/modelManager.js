// Copyright 2023 Seakaytee, Inc.
//
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

const fs = require("fs");
const path = require("path");
const Strings = require("../constants/strings.js");
const keyMaker = require("../constants/keymaker.js");

/**
This is the ModelManager class.
 */
class ModelManager {

  // This is a dictionary of available models.
  models;

  //The activeModel is the default model identified in environment variables.
  //This one gets the initial task for a new agent, and other tasks not assigned a specific model
  activeModel;

  // This constructor initializes the model manager.
  constructor() {
    this.id = keyMaker();
    this.models = {};
    this.loadModels();
    this.activeModel = this.getModel(process.env.DEFAULT_MODEL || Strings.defaultModel);
  }

  // This method loads the models from the `models` directory.
loadModels() {
    const modelsDir = "./models";

    const modelFiles = fs.readdirSync(modelsDir);
    for (const modelFile of modelFiles) {
        const modelPath = path.resolve(modelsDir, modelFile);
        if (path.extname(modelPath) === ".js") {
            const model = new (require(modelPath))();
            model.name = model.name || path.basename(modelFile, ".js");
            this.models[model.name] = model;
        }
    }
  }

  // This method gets a model by name.
  getModel(name)  {
    return this.models[name] || this.activeModel;
  }

  get ModelNames() {
    const modelNames = Object.values(this.models).map(model => model.name);
    return `${modelNames.join(' ')}.`;
  }
}

module.exports = ModelManager;
