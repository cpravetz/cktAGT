// Copyright 2023 Seakaytee, Inc.
//
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

// This module provides a class for representing a database plugin.

const database = require("mysql");

class DatabasePlugin {

  // The version of the plugin.
  version= 1.0;

  // The name of the command.
  command= 'QueryDB';

  // The description of the command.
  description= 'Executes SQL commands a given database';

  // The arguments for the command.
  args= {
    host: 'SQL Server URL',
    port: 'SQL Server port',
    database: 'The name of the database',
    username: 'A username to be used to execute the query',
    password: 'A password to use',
    query: 'The SQL command to be executed',
  };

  // This method connects to the database.
  connect(host, port, database, username, password) {
    this.connection = new database.Connection(host, port, database, username, password);
  }

  // This method executes a query.
  execute(agent, command, task) {
    this.connect(command.args.host, command.args.port, command.args.database, command.args.username, command.args.password);
    const query = this.connection.query(command.args.query);
    const t = new Task(this.task.agent, keyMaker(),
                  'Query Send', 'sending the query results from '+command.args.query+' to the LLM',
                  'this is the result of '+command.args.query,
                  [{name:'Think', model: thisStep.model||false, args:{prompt:query}}],
                  {from: this});
        return {
          outcome: 'SUCCESS',
          results: {
            file: text,
          },
          tasks: [t]
        };

  }
}

module.exports = DatabasePlugin;
