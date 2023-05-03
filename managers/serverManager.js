// Copyright 2023 Seakaytee, Inc.
//
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

const socket = io();

let serverManager;

// The ServerManager provides a common interface for interacting on the client side
class ServerManager {

  constructor() {

  }

  chat(text, justify) {
        if (typeof(text) === Object) {
            text = text.response || text;
        }
        var li = document.createElement("li");
        li.style.justifyContent = justify || 'right';

        // Set the text content of the `li` element.
        if (!(typeof(text) === 'string')) {
            text = JSON.stringify(text);
        }
        li.innerText = text.trim();

        // Append the `li` element to the list.
        document.getElementById("chatThread").appendChild(li);
        window.scrollTo(0, document.body.scrollHeight);
    }

  // This function adds a file name to the list of files.
  _addFileName(name, url) {
    const li = document.createElement("li");
    const aTag = document.createElement('a');
    aTag.href = url;
    aTag.textContent = name;
    li.appendChild(aTag);

    // Append the `li` element to the list.
    document.getElementById("filesList").appendChild(li);
  }

  // This function sends a request to the server.  Usually triggered by an answer
  say(message) {
    this.chat(message.response || message,'right');
    if (this.askId) {
      message.id = this.askId;
      this.askId = false;
    }
    console.log(socket.emit('userSays', JSON.stringify(message)));
  }

  // This function gets a message from the server
  hear(message) {
    this.chat(message,'left');
  }

  // This function answers sends the server a new request in response to an ask
  answer(msg) {
    serverManager.asked = {prompt: msg.prompt.prompt || msg.prompt,
                           choices: msg.prompt.choices || false };
    let allowMultiple = msg.allowMultiple || false;
    this.askId = msg.id;
    // Say the prompt.
    this.hear(serverManager.asked.prompt);
    var inputSpace = document.getElementById("inputSpace");
    var checkSpace = document.getElementById("checkSpace");
    var radioSpace = document.getElementById("radioSpace");
    // If choices is null, make inputSpace a text input and wait for the user to press the Submit button (id="Submit") and return the text in the input field.
    if (!serverManager.asked.choices) {
      var inputSpace = document.getElementById("inputSpace");
      inputSpace.style.display = 'block';
      checkSpace.style.display = 'none';
      radioSpace.style.display = 'none';
      inputSpace.value = "";
    } else {
      // If allowMultiple is true, then the function creates checkboxes for each item in choices and waits for the user to press the Submit button then submits the text of the checkboxes checked as an array.
      if (allowMultiple) {
        var checkboxes = [];
        for (const choice of serverManager.asked.choices) {
          var checkbox = document.createElement("input");
          checkbox.name = 'aCheckBox';
          checkbox.type = "checkbox";
          checkbox.value = choice;
          checkbox.textContent = choice;
          checkboxes.push(checkbox);
        }

        for (box of checkboxes) {
          checkSpace.appendChild(box);
        }

        inputSpace.style.display = 'none';
        checkSpace.style.display = 'block';
        radioSpace.style.display = 'none';

      } else {
        // If allowMultiple is false, the function creates a radiobutton type input using the strings in choices as the options and waits for the user to press Submit, then returns the text of the selected option as a string.
        var radioButtons = [];
     for (const choice of serverManager.asked.choices) {
        var radioButton = document.createElement("input");
        radioButton.type = "radio";
        radioButton.name = "aRadioButton";
        radioButton.value = choice;
        radioButtons.push(radioButton);
        radioSpace.appendChild(radioButton);
        var label = document.createElement("label");
        label.innerHTML = choice+ '<br/>';
        label.for = i.toString();
        radioButtons.push(label);
        radioSpace.appendChild(label);
     }
     inputSpace.style.display = 'none';
     checkSpace.style.display = 'none';
     radioSpace.style.display = 'block';
    }
  }
 }
}

socket.on('serverSays', function(msg) {
    if (msg.prompt) {
        serverManager.answer(msg)
    } else {
        serverManager.hear(msg);
    }
});

socket.on('serverFileAdd', function(msg) {
    console.log('new Work File:'+msg);
    if (msg.fileName) {
        serverManager.answer(msg)
    } else {
        serverManager._addFileName(msg.fileName, msg.url);
    }
});

socket.on('serverNeedsApproval', function(msg) {
  document.getElementById("getApproval").style.display = 'block';
});

updateApproval = function() {
  // Get the value of the checkbox.
  const continuous = document.getElementById("continuous").checked;

  // Get the value of the text input field.
  const steps = document.getElementById("steps").value;
  document.getElementById("getApproval").style.display = 'none';
  // Send a socket emit.
  socket.emit("userApproves", {
    continuous: continuous,
    steps: steps
  });
}

sendInputData = function() {
    var inputSpace = document.getElementById("inputSpace");
    var checkSpace = document.getElementById("checkSpace");
    var radioSpace = document.getElementById("radioSpace");
    if (inputSpace.style.display != 'none') {
        var text = inputSpace.value;
        // Return the text.
        serverManager.say({type: 'answer', prompt: serverManager.answer.prompt, response:text});
        inputSpace.value = "";
    }
    if (checkSpace.style.display != 'none') {
        // Get the checkboxes in the div.
        var checkedTexts = [];

        while (checkSpace.hasChildNodes()) {
            if (checkSpace.firstChild.checked) {
                checkedTexts.push(checkSpace.firstChild.value);
            }
            checkSpace.removeChild(checkSpace.firstChild);
        }
        // Return the text of the checkboxes checked.
        serverManager.say({type: 'answer', prompt: serverManager.answer.prompt, response:checkedTexts});
        checkSpace.style.display = 'none';
        inputSpace.style.display = 'block';
    }
    if (radioSpace.style.display != 'none') {
        // Get the text of the selected radio button.
        var selectedText = "";
        while (radioSpace.hasChildNodes()) {
            if (radioSpace.firstChild.checked) {
                selectedText = radioSpace.firstChild.value;
            }
            radioSpace.removeChild(radioSpace.firstChild);
        }
        serverManager.say({type: 'answer', prompt: serverManager.answer.prompt, response:selectedText});
        radioSpace.style.display = 'none';
        inputSpace.style.display = 'block';
    }
}

document.addEventListener("DOMContentLoaded", function() {
    serverManager = new ServerManager();

    serverManager.say('We are up and ready');

    document.getElementById("submit").addEventListener("click", function() {
        sendInputData();
    });

    document.getElementById("inputSpace").addEventListener("keypress", (event) => {
        if (event.keyCode === 13) {
            sendInputData();
        }
    });

    document.getElementById("stepSubmit").addEventListener("click", () => {
        updateApproval();
    });

    document.getElementById("continuous").addEventListener("change", () => {
        updateApproval();
    });

});
