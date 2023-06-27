// Copyright 2023 Seakaytee, Inc.
//
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

// This module contains strings that are used by the agent manager.

const Strings = {
  // A message that is displayed when the agent manager is ready.
  welcome: 'Your agent manager is now ready. Do you want to start a new agent or continue with an existing agent?',

  startLoadAsk : {start: 'Start a new agent with a new goal', load: 'Restart an existing agent'},

  newAgentMsg:'Provide a set of instructions for the agent to tackle. Begin with a goal, then add any constraints or parameters that might apply. Remember that this is experimental software and could waste your time and your money.',

  runningAgentMsg:'Enter any information you wish to have sent to the Agent',
  // A message that is displayed when the agent is asked for its goal.
  goalPrompt: `What is your goal?`,

  // A message that is displayed when the agent is considering a goal.
  thoughtPrefix: `We are an autonomous agent that works toward achieving the goal in the following messages. 
  Imagine three different experts are working with us. These brilliant, logical experts collaboratively work to reach the goal. Each one 
  verbosely explains their thought process in real-time, considering the prior explanations of others and openly acknowledging mistakes. At 
  each step, whenever possible, each expert refines and builds upon the thoughts of others, acknowledging their contributions. They continue 
  until there is a definitive plan to achieve the goal.  If we are provided a task instead of a goal, we work with the experts to accomplish the
  task.

  Each step in our action plan should be supported by one or more plugin commands.


Return response only in this JSON format:

{
  thoughts: {
    text: your thoughts,
    reasoning: reasoning behind your response,
    actions: array of strings each a numbered logical step in the plan to achieve the goal,
  },
  commands: [
    {
      id: sequential number to identify this command from others,
      name: name of the command, must match an associated plugins command name,
      action: number of the first action in thoughts from which this command stems,
      args: array of arguments to pass the executing plugin in the form {'arg name': ,'value':}
	          any argument values that come from another command should be shown as {output:n} where n is the command number creating the input value,
      model: if this command name is Think, select the LLM from the list I can use that is best suited to execute the command accurately and cost efficiently.
      dependencies: array of the id numbers of any commands that must precede this one.
    }
  ]
}

Commands are calls to the plugins needed for this plan.  Plugin definitions are:
`,

  modelListPrompt: 'The LLM APIs I can interact with are ',

  // A message that is displayed when the agent is considering a task.
  subThoughtPrefix: 'Continuing to work towards our goal, consider the following task. If it is immediately resolvable, do so. Otherwise, develop a plan of the steps needed to complete the task and ultimately reach the goal.',



  // A message that is displayed when the agent is asked to wrap a function in a class template.
  pluginBuilderPrompt: `
Write a javascript plugin to [t.a.d]. Return your new code without any surrounding text, just the contents of the js file.  Precede the class with any require()
statements for packages the plugin uses.

Wrap this node/javascript function in the following class template:

class [task.args.command]Plugin {

  constructor() {
    this.version = 1.0;
	this.command =  '[t.a.c]';
    this.description: '[t.a.d]';
	this.args: JSON object with key/value pairs for each input needed by execute() with argName as the key and a description as the value

	//Any other initialization code can go here, but no parameters are passed to the constructor
  }

  execute(agent, command, task) {
    // New function goes here
  }
}

Configuration constants like username and password should come from process.env properties.

The execute() inputs are:
	agent ( class with the following properties:
		agentManager: (object with a dictionary of agents.  If you create a new agent, call agentManager.addSubAgent(newAgent,start) - if start is true, the newAgent will be started )
		taskManager: (object with a list of all Tasks.  Use add(newTask) to add a task to the queue for either the passed agent or a new one created in the execute() )
		pluginManager(): (object with a dictionary of existing plugins.  getPluginsFor(commandName) will return an array of plugins that handle commandName.
		memoryManager: (data object for tasks.  use load(taskId) to get and save(task) to put tasks.
		userManager: (user interface, call say(msg) to send a msg to the user and ask(prompt, choices, allowMultiple) to ask for input.
				Prompt is shown to the user, choices is a dictionary of value:displayText and allowMultiple=true or false)
		store : LLM object being used as the default for the system.
		)

	command (object the new plugin will execute against with the properties:
		name: the command name, a verb or verbNoun
		args: the arg value for the args structure you defined for the class definition, these are the arguments your plugin will process in execute()
		)

	task (the task object initiating the call to this plugin.)

The input task and any tasks you create have the following properties:
		agent : agent owning the task
		id : a unique id
		name : short name for task
		description : one-line description of the tasks purpose
		goal: string with the objective of the task in a manner an LLM would understand
		context: array of strings that would help frame the goal
		commands: array of the commands, using the above format, that will be passed to plugins.

If the plugin creates a new task, call new Task(...) with an object containing the properties described above (excluding the Id)
To create a new agent, call new Agent(agent.agentManager) inside the execute function

The plugin execute() returns the following object:

{
  outcome: 'SUCCESS' or 'FAILURE',
  text: string to show the user via the say() function once the execute() completes
  results: {object with command specific results, for failures will have error: with an error message},
  tasks: [array of new tasks to be launched]
}
`,

  // The default model that is used by the agent.
  defaultModel: 'gpt-3.5-turbo',


 

  // A function that formats a response from the agent.
  textify: (obj) => {
    let text = 'The agent responds: '
      + '\n\t' + obj.thoughts.text || '';
    if (obj.thoughts.reasoning) {
      text += '\n\n\tReasoning:\n\t\t' + obj.thoughts.reasoning;
    }
    if (obj.thoughts.actions) {
      text += '\n\n\tActions:';
      for (const action of obj.thoughts.actions) {
        text += '\n\t\t' + action;
      }
    }
    if (obj.commands) {
      text += '\n\n\tCommands:';
      for (const cmd of obj.commands) {
        text += '\n\t\t' + cmd.name;
        if (cmd.model) {
          text += '\n\t\t\tModel: ' + cmd.model;
        }
        /*
        text += '\n\t\t\tArguments:\n';
        for (const arg of cmd.args) {
          text += '\t\t\t\t' + JSON.stringify(arg) + '\n';
        }
        */
      }
    }
    return text.trim().replace(/\\t/g, "\t").replace(/\\n/g, "\n");
  }
};

module.exports = Strings;
