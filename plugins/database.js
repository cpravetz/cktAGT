// Copyright 2023 Seakaytee, Inc.
//
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

// This module provides a class for representing a database plugin.

const mySql = require("mysql");
const Task = require('./../managers/task.js');
const logger = require('./../constants/logger.js');

class DatabasePlugin {

  constructor() {  
    // The version of the plugin.
    this.version = 1.0;

    // The name of the command.
    this.command = 'QueryDB';

    // The description of the command.
    this.description = 'Executes SQL commands against a database that you know exists';

    // The arguments for the command.
    this.args = {
      host: 'SQL Server URL',
      port: 'SQL Server port',
      database: 'The name of the database',
      username: 'A username to be used to execute the query',
      password: 'A password to use',
      query: 'The SQL command to be executed',
      sendToLLM: 'if true, generates a new task to send the query result to you or another LLM'
    };

  }

  // This method connects to the database.
  connect(host, port, database, username, password) {
    this.connection = new mySql.createConnection({host:host, port:port, user: username, password: password, database: database});
    return new Promise((resolve, reject) => {
      this.connection.connect((err,results) => {
        if(err){
          logger.error({error:err},`database: SQL connection error ${err.message}`);
          reject(err)
        }
        resolve(results)
      })
    });
  }

  sanitizeSQL(sql) {
    //TODO Add a function to eliminate desunsafe SQL calls
    return sql;
  }
  

  promisedQuery(connectArgs) {
    return new Promise((resolve, reject) => {
      this.connect(connectArgs.host, connectArgs.port, connectArgs.database, connectArgs.username, connectArgs.password);
      const cleanSQL = this.sanitizeSQL(connectArgs.query);
      this.connection.query(cleanSQL,(err,results)=>{
          if(err){
            logger.error({error:err, sql: cleanSQL},`SQL query error ${err.message}`);
            reject(err)
          }
          this.connection.end();
          logger.debug({results:results},'database: Query result');
          resolve(results)
      })
    });
  }

  // This method executes a query.
  async execute(agent, command, task) {
    try {
      const queryResult = await this.promisedQuery(command.args);
      const tasks = [];
      if (command.args.sendToLLM) {
        const newTask = new Task({agent:agent,
          name:'Query Send', description:'sending the query results from '+command.args.query+' to the LLM',
          prompt:'this is the result of '+command.args.query,
          commands:[{name:'Think', model: agent.getModel().name, args:{prompt:queryResult}}],
          context:{from: this.id}})
        logger.debug({task:newTask.debugData()},'database: created task');  
        tasks.push(newTask);
      }            
      return {
        outcome: 'SUCCESS',
        results: {
          file: queryResult,
        },
        tasks: tasks
      };
    } catch (err) {
      logger.error({error:err},`database: execute error ${err.message}`);
      return {
        outcome: 'FAILURE',
        text : err,
        results : {
          error: err
        }
      }
    }
  }

}

module.exports = DatabasePlugin;
