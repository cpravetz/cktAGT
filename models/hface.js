const Model = require('./bases/model.js');
const hfi = require("@huggingface/inference");
const fetch =  require('node-fetch');

/**
 * A class representing the GPT-4 model.
 */

class HuggingFace extends Model {
  configuration;
  hfiClient;
  inputCache;
  outputCache;
  name = 'huggingface';
  DEFAULT_MAX_LENGTH = Number(process.env.DEFAULT_MAX_LENGTH) || 500;
  DEFAULT_TEMPERATURE = Number(process.env.DEFAULT_TEMPERATURE) || 0.7;
  chatLength = Number(process.env.LLM_CHAT_LENGTH) || 5;
  languageModel;
  token;

  constructor(options = {}) {
    super();
    const { languageModel = process.env.DEFAULT_HF_LLM } = options;
    const { token = process.env.HUGGINGFACE_TOKEN } = options;
    this.languageModel = languageModel;
    this.token = token;
    if (!token) {
      throw new Error('HuggingFace TOKEN key not provided');
    }
    try {
      this.hfiClient = new hfi.HfInference(token);
    } catch (error) {
      console.error('Invalid HuggingFace API key:', error);
      throw error;
    }
    this.inputCache = [];
    this.outputCache = [];
  }

  async generate(message, parameters = {}) {
    if (!message || (typeof message !== 'string')) {
      throw new TypeError('Invalid input type for message expected a string');
    }
    parameters.max_length = parameters.max_length || this.DEFAULT_MAX_LENGTH;
    if (parameters.max_length > 500) { parameters.max_length = 500;}
    parameters.temperature = parameters.temperature || this.DEFAULT_TEMPERATURE;
    this.inputCache.push(message);
    const conversation = {
      model: this.languageModel,
      inputs: {
        past_user_inputs: (this.inputCache.length <= this.chatLength) ? this.inputCache : this.inputCache.slice(this.inputCache.length - this.chatLength),
        generated_responses: (this.outputCache.length <= this.chatLength) ? this.outputCache : this.outputCache.slice(this.outputCache.length - this.chatLength),
        text: message
      },
      parameters: parameters,
      options: { wait_for_model: true }
    };
    try {
      const response = await this.hfiClient['conversational'](conversation, { fetch: fetch });
      this.outputCache.push(response);
      return response;
    } catch (err) {
      console.error(err);
      throw err
    }
  }

  getCache() {
    return [this.inputCache, this.outputCache];
  }

  setCache(cache) {
    if (Array.isArray(cache)) {
      this.inputCache = cache[0];
      this.outputCache = cache[1];
    }
  }
}
      
      module.exports = HuggingFace;