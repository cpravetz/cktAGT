// Copyright 2023 Seakaytee, Inc.
//
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

const fs = require("fs");
const path = require("path");

// This is the PluginManager class.
class PluginManager {

  // This is a dictionary of available plugins.
  plugins= {} //{ [key: string]: any } = {};

  // This constructor initializes the plugin manager.
  constructor() {
    this.loadPlugins();
  }

  // This method loads the plugins from the `plugins` directory.
  loadPlugins() {
    const pluginsDir = "./plugins";
    for (const file of fs.readdirSync(pluginsDir)) {
      const pluginPath = path.join(pluginsDir, file);
      if (fs.statSync(pluginPath).isFile() && pluginPath.endsWith(".js")) {
        const code = require(`../${pluginPath}`);
        const plugin = new code();
        this.plugins[file] = plugin;
      }
    }
  }

  // This method gets a plugin by name.
  getPlugin(name) {
    return this.plugins[name];
  }

  // This method returns the plugin(s) that can process a given command.
  getPluginsFor(command) {
    const plugins = [];
    for (const [name, plugin] of Object.entries(this.plugins)) {
      if (plugin.command === command) {
        plugins.push(plugin);
      }
    }
    return plugins;
  }

  // This method takes a given command for a task and finds the correct plugins to process it, then calls those in turn.
  async resolveCommand(command, task) {
    const plugins = this.getPluginsFor(command.name);
    const results = [];
    for (const plugin of plugins) {
      const result = await plugin.execute(task.agent, command, task);
      results.push(result);
    }
    return results;
  }

  describePlugins() {
    let response = '';
    for (const [name, plugin] of Object.entries(this.plugins)) {
        response += 'Command: '+plugin.command+'\n'
                 +   '  description:'+(plugin.description || '')
                 +   '\n    arguments:'+JSON.stringify(plugin.args)
                 +   '\n';
    }
    return response
  }
}

module.exports = PluginManager;
