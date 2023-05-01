const chai = require('chai');
const expect = chai.expect;
const ThoughtGeneratorPlugin = require('./../plugins/thinker.js');
const Agent = require('./../managers/agent.js');
const AgentManager = require('./../managers/agentManager.js');
const { stubAgent, stubAgentManager, stubTask } = require('./stubs/stubs.js');
const Bard = require('./../models/bard.js');

// This is the Mocha test suite.
describe("Thought Generator Plugin", () => {

  // This test ensures that the plugin can be instantiated.
  it("should be able to be instantiated", () => {
    // Create a new plugin instance.
    const plugin = new ThoughtGeneratorPlugin();

    // Check that the plugin instance is not null.
    expect(plugin).not.to.be.null;
  });

  // This test ensures that the plugin can generate text.
  it("should be able to generate text", async () => {
    // Create a new plugin instance.
    const plugin = new ThoughtGeneratorPlugin();

    // Set the prompt.
    const prompt = "What is your name?";

    // Generate the text.
    let agent = new Agent('realAgent', new stubAgentManager());
    agent.model = new Bard();
    const response = await plugin.execute(agent, {
      args: {
        prompt,
      },
    }, new stubTask());

    // Check that the text was generated successfully.
    expect(response.text).to.equal("My name is Bard.");
  });

});
