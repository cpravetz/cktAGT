const Model = require('./model.js');
const hfi = require("@huggingface/inference");
const fetch =  require('node-fetch');

/**
 * A class representing the GPT-4 model.
 */
class HuggingFace extends Model {
  /**
   * The Hugging Face API configuration.
   */
  configuration;

  /**
   * The Hugging Face API instance.
   */
  hfiClient;

  /**
   * The Conversation Caches
   */
  inputCache;
  outputCache;

  constructor(llm = process.env.DEFAULT_HF_LLM) {
    super();
    /**
     * Default values for max_length and temperature.
     */
    this.DEFAULT_MAX_LENGTH = Number(process.env.LLM_MAX_TOKENS) || 2000;
    this.DEFAULT_TEMPERATURE = Number(process.env.LLM_TEMPERATURE) || 0.7;
    this.inputCache = [];
    this.outputCache = [];
    this.chatLength = Number(process.env.LLM_CHAT_LENGTH) || 5;
    this.llm = llm;
    /**
     * The name of the model.
     */
    this.name = 'huggingface';

    this.configuration = new Configuration({
      apiKey: process.env.HUGGINGFACE_API_KEY
    });
    this.hfiClient = new hfi.HfInference(this.token);

  }

  async generate(message, parameters = {}) {

    // Check for invalid input type for messages.
    if (!message || (typeof message !== 'string')) {
      throw new TypeError('Invalid input type for message expected a string');
    }

    parameters.max_length = parameters.max_length || this.DEFAULT_MAX_LENGTH;
    parameters.temperature = parameters.temperature || this.DEFAULT_TEMPERATURE;

    // Format messages.
    this.inputCache = this.inputCache.push(message);
    const conversation = {model:this.llm,
                          inputs: {past_user_inputs: (this.inputCache.length <= this.chatLength) ? this.inputCache : this.inputCache.slice(this.inputCache.length - this.chatLength),
                                   generated_responses: (this.outputCache.length <= this.chatLength) ? this.outputCache : this.outputCache.slice(this.outputCache.length - this.chatLength),
                                   text: message
                                  },
                          parameters: parameters,
                          options: {wait_for_model: true}
                         };
    try {
        // Send the prompt to the model
        const response = await this.hfiClient['conversation'](conversation, {fetch:fetch});
        this.outputCache.push(response);
        return response;
      } catch (error) {
        // Return an error
        console.error(error);
      }
  }

  getCache() {
      return [this.inputCache,this.outputCache];
  }
      
  setCache(cache) {
      if (Array.isArray(cache)) {
        this.inputCache = cache[0];
        this.outputCache = cache[1];
      }
  }
      
}
      
      module.exports = HuggingFace;
