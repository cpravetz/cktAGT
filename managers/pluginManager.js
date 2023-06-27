// Copyright 2023 Seakaytee, Inc.
//
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

const fs = require("fs");
const path = require("path");
const keyMaker = require("../constants/keymaker.js");
const logger = require('./../constants/logger.js');

// This is the PluginManager class.
class PluginManager {

  static instance;

  constructor() {
    if (PluginManager.instance) {
      throw new Error("PluginManager can only be instantiated once");
    }
    this.plugins = new Map();
    this.id = keyMaker();
    this.loadPlugins();
    this.pluginDescription = false;
    PluginManager.instance = this;
  }

  static getInstance() {
    if (!PluginManager.instance) {
      PluginManager.instance = new PluginManager();
    }
    return PluginManager.instance;
  }

  async loadPlugins() {
    const pluginsDir = "./plugins";
    const pluginFiles = await fs.promises.readdir(pluginsDir);
    const pluginPromises = pluginFiles.map(async (file) => {
      const pluginPath = path.resolve(pluginsDir, file);
      const stats = await fs.promises.stat(pluginPath);
      if (stats.isFile() && path.extname(pluginPath) === ".js") {
        try {
          const code = require(pluginPath);
          const plugin = new code();
          this.plugins.set(file, plugin);
        } catch (err) {
          logger.error({filename: file, error:err},`Error loading plugin: ${err.message}`);
        }
      }
    });
    await Promise.all(pluginPromises);
    logger.debug(`Plugins loaded`);
  }

  getPlugin(name) {
    return this.plugins.get(name);
  }

  getPluginsFor(command) {
    if (!this.pluginsByCommand) {
      this.pluginsByCommand = {};
      for (let [key,plugin] of this.plugins) {
        if (!this.pluginsByCommand[plugin.command]) {
          this.pluginsByCommand[plugin.command] = [];
        }
        this.pluginsByCommand[plugin.command].push(plugin);
      }
    }
    return this.pluginsByCommand[command] || [];
  }

  async resolveCommand(command, task) {
    const plugins = this.getPluginsFor(command.name);
    const results = await Promise.all(plugins.map(plugin => plugin.execute(task.agent, command, task)));
    return results;
  }

  getPluginDescription(plugin) {
    return `Command name: ${plugin.command}
      description: ${plugin.description || ''}
      arguments: ${JSON.stringify(plugin.args)}
      `;
  }

  describePlugins() {
    if (!this.pluginDescription) {
        this.pluginDescription = '';
        for (let [key,plugin] of this.plugins) {
          this.pluginDescription += this.getPluginDescription(plugin);
        }
    }
    return this.pluginDescription;
  }

}

module.exports = PluginManager;

