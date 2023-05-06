const huggingface = require("@huggingface/inference");

class HuggingfacePlugin {
  constructor() {
    this.version = 1.0;
    this.command = "huggingface";
    this.description = "Send a prompt to Huggingface and return the response";
    this.args = {
      prompt: {
        description: "The prompt to send to Huggingface",
        type: "string",
      },
      model: {
        description: "The name of the Huggingface model to use",
        type: "string",
      },
    };
  }

  execute(agent, command, task) {
    const prompt = command.args.prompt;
    const model = command.args.model;

    try {
      // Create a Huggingface client
      const client = new HFInference(process.env.HUGGINGFACE_TOKEN);

      // Send the prompt to the model
      const response = client.textGeneration({model:model, inputs:prompt});

      // Return the response
      return {
        outcome: "SUCCESS",
        text: response,
        results: {},
        tasks: [],
      };
    } catch (error) {
      // Return an error
      return {
        outcome: "FAILURE",
        text: error.message,
        results: {},
        tasks: [],
      };
    }
  }
}

module.exports = HuggingfacePlugin;
