// Copyright 2023 Seakaytee, Inc.
//
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

// This module provides a class for representing a GPT-3.5-Turbo model.

const OpenAI = require('./bases/openai.js');

/**
 * A class representing the GPT-3.5-Turbo model.
 */
class GPT35 extends OpenAI {

  constructor() {
    super();
    this.name = 'gpt-3.5-turbo';
  }

  /*async generate(m,o) {
    return `{
      "thoughts": {
        "text": "To promote cktAGT, we need to create content that generates interest and provide a plan for Chris to follow. The plan should include steps for sharing the content on social media, reaching out to potential partners, and attending relevant events. We can also participate in executing the plan by creating new plugins to automate some tasks.",
        "reasoning": "To promote cktAGT, we need to create content that generates interest and provide a plan for Chris to follow. This plan should include steps for sharing the content on social media, reaching out to potential partners, and attending relevant events. We can also participate in executing the plan by creating new plugins to automate some tasks.",
        "actions": [
          "Create a list of potential partners and events to attend",
          "Develop content that showcases the unique features and benefits of cktAGT",
          "Create social media accounts and develop a strategy for sharing content",
          "Reach out to potential partners and invite them to try cktAGT",
          "Attend relevant events and conferences to showcase cktAGT",
          "Create new plugins to automate tasks such as social media posting and partner outreach"
        ]
      },
      "commands": [
        {
          "id": 1,
          "name": "Think",
          "action": 1,
          "args": {
            "prompt": "Create a list of potential partners and events to attend",
            "constraints": ["Partners should be relevant to cktAGT's target audience and have a strong online presence", "Events should be relevant to cktAGT's target audience and provide opportunities for networking"],
            "assessments": ["Consider industry publications and social media to identify potential partners and events"]
          },
          "model": "GPT-3.5-turbo",
          "dependencies": []
        },
        {
          "id": 2,
          "name": "Think",
          "action": 2,
          "args": {
            "prompt": "Develop content that showcases the unique features and benefits of cktAGT",
            "constraints": ["Content should be engaging and informative", "Content should be tailored to different platforms and audiences"],
            "assessments": ["Consider using multimedia such as videos and infographics to showcase cktAGT's features and benefits"]
          },
          "model": "GPT-3.5-turbo",
          "dependencies": []
        },
        {
          "id": 3,
          "name": "Think",
          "action": 3,
          "args": {
            "prompt": "Create social media accounts and develop a strategy for sharing content",
            "constraints": ["Social media accounts should be created on platforms relevant to cktAGT's target audience", "The strategy should include a mix of promotional and informative content"],
            "assessments": ["Consider using social media management tools to schedule posts and track engagement"]
          },
          "model": "Bard",
          "dependencies": []
        },
        {
          "id": 4,
          "name": "Think",
          "action": 4,
          "args": {
            "prompt": "Reach out to potential partners and invite them to try cktAGT",
            "constraints": ["Outreach should be personalized and relevant to the potential partner's needs", "Outreach should include a clear call to action"],
            "assessments": ["Consider using email marketing tools to manage outreach and track engagement"]
          },
          "model": "GPT-4",
          "dependencies": [1]
        },
        {
          "id": 5,
          "name": "Think",
          "action": 5,
          "args": {
            "prompt": "Attend relevant events and conferences to showcase cktAGT",
            "constraints": ["Events should be relevant to cktAGT's target audience and provide opportunities for networking", "Booth and presentation materials should be engaging and informative"],
            "assessments": ["Consider partnering with other companies or organizations to increase visibility and reach"]
          },
          "model": "Bard",
          "dependencies": [1]
        },
        {
          "id": 6,
          "name": "Think",
          "action": 6,
          "args": {
            "prompt": "Create new plugins to automate tasks such as social media posting and partner outreach",
            "constraints": ["Plugins should be user-friendly and customizable", "Plugins should integrate with existing tools and workflows"],
            "assessments": ["Consider using existing plugins as a starting point and customizing them to fit cktAGT's needs"]
          },
          "model": "GPT-3.5-turbo",
          "dependencies": [2, 3, 4]
        }
      ]
    }`;
  }*/

}

module.exports = GPT35;

