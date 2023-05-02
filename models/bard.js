// Copyright 2023 Seakaytee, Inc.
//
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

// This module provides a class for representing a Bard model.

const Model = require('./model.js');

class Bard extends Model {

   constructor() {
    super();
    // The name of the model.
    this.name = 'bard';

    // The base URL for the Bard API.
    this.baseUrl = 'https://bard.google.com/v1/';
   }

  async generate(messages, options) {
    // Create a request object.
    const request = new Request(this.baseUrl + 'generate', {
      method: 'POST',
      body: JSON.stringify({
        messages,
        options,
      }),
    });

    // Send the request and get the response.
    const response = await fetch(request);
    const data = await response.json();

    // Return the responses.
    return data.responses;
  }

}

module.exports = Bard;
