# cktAGT
This is a javascript implementation of an AGT that will be able to:
- create its own plugins to accomplish new tasks it encounters them and
- select optimal LLMs to use based on the Goal and Tasks

Much of this code remains untested and unproven.  Given the capabilities of the system,
it is theoretically possible the system will do things that aren't desirable especially if you
give it destructive prompts or allow it to build harmful code.

These are very early days.  The front-end is barebones.  Don't laugh at it.

You need to install node and the packages listed in package.json.  Settings are stored in a file named .env
in the root directory.



The pluginManager class loads all plugins from the ./plugins folder.

    All plugins has the save basic structure
    {
        version - returns a version number, which is not used yet
        command - returns the name of the command that this plugin handles
        args: a description of the inputs needed by the function
            ...plugin specific code...
        execute(agent, command, task) - processes the commandObject and returns a structured outputObject
    }

    the commandObject is
    {
        name: the name for this instaance of a command,
        args: { an object with the arguments required for this particular command }
    }

    the outputObject is
    {
        outcome: either 'SUCCESS' or 'FAILURE',
        command: the initiating command object,
        task: the associated task,
        text: a string to show the human user via the say() function in the agent,
        results: {an object with command specific results, for failures will have error: with an error message},
        tasks: [an array of new tasks to be launched]
    }


