const Strings = require("../constants/strings.js");
const Model = require('./bases/model.js');
const hfi = require("@huggingface/inference");
const fetch =  require('node-fetch');
const Request =  require('node-fetch');
const logger = require('./../constants/logger.js');

/**
 * A class representing the huggingface model API.
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
      logger.error('HuggingFace TOKEN key not provided');
      throw new Error('HuggingFace TOKEN key not provided');
    }
    try {
      this.hfiClient = new hfi.HfInference(token);
    } catch (err) {
      logger.error({error: err},`Invalid HuggingFace API key ${err.message}`);
      throw err;
    }
    this.inputCache = [];
    this.outputCache = [];
  }

  async checkModelExists() {
    const url = `https://api-inference.huggingface.co/models/${this.languageModel}`;
    let validModel = true;
    try {
      const response = await fetch(url);
      if (response.status != 200) {
        validModel = false;
      }
    } catch (err) {
      validModel = false;
    }
    if (!validModel) {
      logger.info(`hface: The model ${this.languageModel} does not exist. Using gorilla.`);
      this.languageModel = 'microsoft/DialoGPT-large';
      //this.languageModel = 'gorilla-llm/gorilla-falcon-7b-hf-v0';
    }
  }

  async generate(message, parameters = {}) {
    message = Strings.toHumanString(message[0] || message);
    if (!message || (typeof message !== 'string')) {
      logger.error('hFace: Invalid input type for message expected a string');
      throw new TypeError('hFace: Invalid input type for message expected a string');
    }
    this.languageModel = parameters.languageModel || this.languageModel;
    await this.checkModelExists();
    if (parameters.languageModel) { delete parameters.languageModel };
    parameters.max_length = parameters.max_length || this.DEFAULT_MAX_LENGTH;
    if (parameters.max_length > 500) { parameters.max_length = 500;}
    parameters.temperature = parameters.temperature || this.DEFAULT_TEMPERATURE;
    if (this.inputCache.length < 1) {
      this.inputCache = [Strings.thoughtPrefix + await this.describePlugins()];      
    }
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
      logger.debug({response: response, conversation:conversation},'HfI Generate');
      this.inputCache.push(message);
      this.outputCache.push(response.generated_text);
      return response;
    } catch (err) {
      logger.error({error:err},`hface Error in generate ${err.message}`);
      throw err
    }
  }

  getCache() {
    return [this.inputCache, this.outputCache];
  }

  setCache(cache) {
    if (Array.isArray(cache) && cache.length > 1) {
      this.inputCache = cache[0];
      this.outputCache = cache[1];
    }
  }
}
      
      module.exports = HuggingFace;