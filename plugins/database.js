// Copyright 2023 Seakaytee, Inc.
//
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

// This module provides a class for representing a database plugin.

const mySql = require("mysql");
const Task = require('./../managers/task.js');

class DatabasePlugin {

  constructor() {  
    // The version of the plugin.
    this.version = 1.0;

    // The name of the command.
    this.command = 'QueryDB';

    // The description of the command.
    this.description = 'Executes SQL commands against a given database that you know exists';

    // The arguments for the command.
    this.args = {
      host: 'SQL Server URL',
      port: 'SQL Server port',
      database: 'The name of the database',
      username: 'A username to be used to execute the query',
      password: 'A password to use',
      query: 'The SQL command to be executed',
    };


  }

  // This method connects to the database.
  connect(host, port, database, username, password) {
    this.connection = new mySql.createConnection({host:host, port:port, user: username, password: password});
    this.connection.connect(function(err) {
      if (err) {
        console.error('error connecting: ' + err.stack);
        return;
      }
    });
  }

  // This method executes a query.
  execute(agent, command, task) {
    this.connect(command.args.host, command.args.port, command.args.database, command.args.username, command.args.password);
    const query = this.connection.query(command.args.query);
    const t = new Task({agent:agent,
                  name:'Query Send', description:'sending the query results from '+command.args.query+' to the LLM',
                  prompt:'this is the result of '+command.args.query,
                  commands:[{name:'Think', model: agent.getModel().name, args:{prompt:query}}],
                  context:{from: this.id}});
        return {
          outcome: 'SUCCESS',
          results: {
            file: query,
          },
          tasks: [t]
        };

  }
}

module.exports = DatabasePlugin;
