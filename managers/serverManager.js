// Copyright 2023 Seakaytee, Inc.
//
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

const socket = io();

// The ServerManager provides a common interface for interacting on the client side
class ServerManager {

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
    this.chat(message,'right');
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
    let prompt = msg.prompt || false;
    let choices = msg.choices || false;
    let allowMultiple = msg.allowMultiple || false;
    this.askId = msg.id;
    // Say the prompt.
    this.hear(prompt);
    var inputSpace = document.getElementById("inputSpace");
    var checkSpace = document.getElementById("checkSpace");
    var radioSpace = document.getElementById("radioSpace");
    // If choices is null, make inputSpace a text input and wait for the user to press the Submit button (id="Submit") and return the text in the input field.
    if (!choices) {
      var inputSpace = document.getElementById("inputSpace");
      inputSpace.type = "text";
      inputSpace.style.display = 'block';
      checkSpace.style.display = 'none';
      radioSpace.style.display = 'none';
      inputSpace.value = "";
    } else {
      // If allowMultiple is true, then the function creates checkboxes for each item in choices and waits for the user to press the Submit button then submits the text of the checkboxes checked as an array.
      if (allowMultiple) {
        var checkboxes = [];
        for (var i = 0; i < choices.length; i++) {
          var checkbox = document.createElement("input");
          checkbox.name = 'aCheckBox';
          checkbox.type = "checkbox";
          checkbox.value = choices[i];
          checkbox.textContent = choices[i];
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
     for (var i = 0; i < choices.length; i++) {
        var radioButton = document.createElement("input");
        radioButton.type = "radio";
        radioButton.value = choices[i];
        radioButton.textContent = choices[i];
        radioButtons.push(radioButton);
     }

     for (radio of radioButtons) {
       radioSpace.appendChild(radio);
     }
     inputSpace.style.display = 'none';
     checkSpace.style.display = 'none';
     radioSpace.style.display = 'block';
    }
  }
 }
}

socket.on('serverSays', function(msg) {
    console.log('server Said:'+msg);
    if (msg.prompt) {
        ServerManager.answer(msg)
    } else {
        ServerManager.hear(msg);
    }
});

socket.on('serverFileAdd', function(msg) {
    console.log('new Work File:'+msg);
    if (msg.fileName) {
        ServerManager.answer(msg)
    } else {
        ServerManager._addFileName(msg.fileName, msg.url);
    }
});

function updateApproval {
  // Get the value of the checkbox.
  const continuous = document.getElementById("continuous").checked;

  // Get the value of the text input field.
  const steps = document.getElementById("steps").value;

  // Send a socket emit.
  socket.emit("userApproves", {
    continuous: continuous,
    steps: steps
  });
}

function sendInputData() {
    var inputSpace = document.getElementById("inputSpace");
    var checkSpace = document.getElementById("checkSpace");
    var radioSpace = document.getElementById("radioSpace");
    if (inputSpace.style.visibility != 'hidden') {
        var text = inputSpace.value;
        // Return the text.
        ServerManager.say({type: 'answer', prompt: prompt, response:text});
        inputSpace.value = "";
    }
    if (checkSpace.style.visibility != 'hidden') {
        // Get the checkboxes in the div.
        const checkboxes = document.getElementsByName("myCheckboxes");
        var checkedTexts = [];

        while (checkSpace.hasChildNodes()) {
            if (checkSpace.firstChild.checked) {
                checkedTexts.push(checkSpace.firstChild.value);
            }
            checkSpace.removeChild(checkSpace.firstChild);
        }
        // Return the text of the checkboxes checked.
        say({type: 'answer', prompt: prompt, response:checkedTexts});
        checkSpace.style.display = 'none';
        inputSpace.style.display = 'block';
    }
    if (radioSpace.style.visibility != 'hidden') {
        // Get the text of the selected radio button.
        var selectedText = "";
        while (radioSpace.hasChildNodes()) {
            if (radioSpace.firstChild.checked) {
                selectedText = radioSpace.firstChild.value;
            }
            radioSpace.removeChild(checkSpace.firstChild);
        }
        say({type: 'answer', prompt: prompt, response:selectedTexts});
        radioSpace.style.display = 'none';
        inputSpace.style.display = 'block';
    }
}

document.addEventListener("DOMContentLoaded", function() {
    ServerManager.say('We are up and ready');

    document.getElementById("submit").addEventListener("click", function() {
        sendInputData();
    });

    document.getElementById("myInput").addEventListener("keypress", (event) => {
        if (event.keyCode === 13) {
            sendInputData();
        }
    });

    document.getElementById("stepSubmit").addEventListener("click", () => {
        updateApproval();
    });

    continuousCheckbox.addEventListener("change", () => {
        updateApproval();
    });

});
