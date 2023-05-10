// Copyright 2023 Seakaytee, Inc.
//
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

const fs = require("fs");
const path = require("path");
const keyMaker = require("../constants/keymaker.js");

// This is the PluginManager class.
class PluginManager {
  constructor() {
    this.plugins = {};
    this.id = keyMaker();
    this.loadPlugins();
    this.pluginDescription = false;
  }

  async loadPlugins() {
    const pluginsDir = "./plugins";
    const pluginFiles = await fs.promises.readdir(pluginsDir);
    const pluginPromises = pluginFiles.map(async (file) => {
      const pluginPath = path.resolve(pluginsDir, file);
      const stats = await fs.promises.stat(pluginPath);
      if (stats.isFile() && path.extname(pluginPath) === ".js") {
        const code = require(pluginPath);
        const plugin = new code();
        this.plugins[file] = plugin;
      }
    });
    await Promise.all(pluginPromises);
  }

  getPlugin(name) {
    return this.plugins[name];
  }

  getPluginsFor(command) {
    if (!this.pluginsByCommand) {
      this.pluginsByCommand = {};
      for (const plugin of Object.values(this.plugins)) {
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
    return `Command: ${plugin.command}\n  description: ${plugin.description || ''}\n    arguments: ${JSON.stringify(plugin.args)}\n`;
  }

  describePlugins() {
    if (!this.pluginDescription) {
        this.pluginDescription = '';
        for (const plugin of Object.values(this.plugins)) {
            this.pluginDescription += this.getPluginDescription(plugin);
        }
    }
    return this.pluginDescription;
  }

}

module.exports = PluginManager;

