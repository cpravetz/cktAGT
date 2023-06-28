// Copyright 2023 Seakaytee, Inc.
//
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

const socket = io();

let serverManager;

// The ServerManager provides a common interface for interacting on the client side
class ServerManager {

  constructor() {
    this.askId = false;
    this.asked = {};
  }

  chat(text, justify) {
    if (typeof(text) === Object) {
      text = text.response || text;
    }
    const li = document.createElement("li");
    li.style.justifyContent = justify || 'right';

    // Set the text content of the `li` element.
    if (!(typeof(text) === 'string')) {
      text = JSON.stringify(text);
    }
    li.textContent = sanitize(text.trim());

    // Append the `li` element to the list.
    document.getElementById("chatThread").appendChild(li);
    window.scrollTo(0, document.body.scrollHeight);
  }

  _addFileName(name, url) {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = url;
    a.textContent = name;
    li.appendChild(a);
    document.getElementById("filesList").appendChild(li);
  }

  say(message) {
    this.chat(message.response || message,'right');
    if (this.askId) {
      message.id = this.askId;
      this.askId = false;
    }
    document.getElementById("inputSpace").placeholder = "Enter a message for your agents.";
    try {
      socket.emit('userSays', JSON.stringify(message));
    } catch (error) {
      socket.emit('userLog', JSON.stringify(error));
      console.error(error);
    }
  }

  acknowledge(message) {
    if (message.id) {
      socket.emit('userAck', message.id);
    }
  }

  hear(message) {
    this.chat(message,'left');
  }

  createCheckboxes(choices) {
    const checkboxes = [];
    for (const [id, choice] of Object.entries(choices)) {
      const checkbox = document.createElement("input");
      checkbox.name = 'aCheckBox';
      checkbox.type = "checkbox";
      checkbox.value = id;
      checkbox.textContent = choice;
      checkboxes.push(checkbox);
    }
    return checkboxes;
  }

  answer(msg) {
    this.asked = {
      prompt: msg.content.prompt,
      choices: msg.content.choices || false,
    };
    const allowMultiple = msg.allowMultiple || false;
    this.askId = msg.id;
    // Say the prompt.
    this.hear(this.asked.prompt);
    const inputSpace = document.getElementById("inputSpace");
    const checkSpace = document.getElementById("checkSpace");
    const radioSpace = document.getElementById("radioSpace");
    if (!this.asked.choices) {
      this.createTextInput(inputSpace, this.asked.prompt);
    } else if (allowMultiple) {
      this.createCheckboxesInput(checkSpace, this.asked.choices);
    } else {
      this. createRadioButtonsInput(radioSpace, this.asked.choices);
    }
  }

  createTextInput(inputSpace, prompt) {
    inputSpace.placeholder = prompt;
    inputSpace.style.display = 'block';
    checkSpace.style.display = 'none';
    radioSpace.style.display = 'none';
    inputSpace.value = "";
  }
  
  createCheckboxesInput(checkSpace, choices) {
    const checkboxes = this.createCheckboxes(choices);
    for (const box of checkboxes) {
      checkSpace.appendChild(box);
    }
    inputSpace.style.display = 'none';
    checkSpace.style.display = 'block';
    radioSpace.style.display = 'none';
  }
  
  createRadioButtonsInput(radioSpace, choices) {
    const radioButtons = this.createRadioButtons(choices);
    for (const button of radioButtons) {
      radioSpace.appendChild(button);
    }
    inputSpace.style.display = 'none';
    checkSpace.style.display = 'none';
    radioSpace.style.display = 'block';
  }
  
  createCheckboxes(choices) {
    const checkboxes = [];
    for (const [id, choice] of Object.entries(choices)) {
      const checkbox = document.createElement("input");
      checkbox.name = 'aCheckBox';
      checkbox.type = "checkbox";
      checkbox.value = id;
      checkbox.textContent = choice;
      checkboxes.push(checkbox);
    }
    return checkboxes;
  }
  
  createRadioButtons(choices) {
    const radioButtons = [];
    for (const [id, choice] of Object.entries(choices)) {
      const radioButton = document.createElement("input");
      radioButton.type = "radio";
      radioButton.name = id;
      radioButton.value = id;
      radioButtons.push(radioButton);
      const label = document.createElement("label");
      label.innerHTML = `${choice}<br/>`;
      label.for = id;
      radioButtons.push(label);
    }
    return radioButtons;
  }
}

function sanitize(text) {
  const element = document.createElement('div');
  element.textContent = text;
  return element.innerHTML;
}

socket.on('tasksChanged', function(msg) {
  //TODO Push all the msg.tasks to the browser
  const pendingList = document.getElementById("pendingTasks");
  const runningList = document.getElementById("runningTasks");
  const completedList = document.getElementById("completedTasks");
  pendingList.innerHTML= '';
  runningList.innerHTML = '';
  for (var i = 0; i < msg.tasks.length; i++) {
    var task = msg.tasks[i];
    var listItem = document.createElement("li");
    listItem.innerHTML = task.name + ' ' + task.text;

    if (task.commands) {
      var commandItems = document.createElement("ul");
      for (const command of task.commands) {
        var commandItem = document.createElement("li");
        commandItem.innerHTML = command.name+' '+JSON.stringify(command.args);
        commandItems.appendChild(commandItem);
        listItem.appendChild(commandItems);
      }
    }

    if (task.status == 'pending') {
      pendingList.appendChild(listItem)
    } else {
      if (task.status == 'running') {
        runningList.appendChild(listItem)
      } else {
        completedList.appendChild(listItem)
      }
    }
  }
});

socket.on('serverSays', function(msg) {
  serverManager.acknowledge(msg);
  if (msg.content.prompt) {
        serverManager.answer(msg)
    } else {
        serverManager.hear(msg.content);
    };
});

socket.on('serverFileAdd', function(msg) {
  serverManager.acknowledge(msg);
  console.log('new Work File:'+msg);
    if (!msg.fileName) {
        serverManager.hear(msg)
    } else {
        serverManager._addFileName(msg.fileName, msg.url);
    }
});

socket.on('serverNeedsApproval', function(msg) {
  serverManager.acknowledge(msg);
  document.getElementById("getApproval").style.display = 'block';
  document.getElementById("stepsBox").style.display = 'block';
});

function updateApproval() {
  // Get the value of the checkbox.
  const continuous = document.getElementById("continuous").checked;

  // Get the value of the text input field.
  const steps = document.getElementById("steps").value;
  document.getElementById("getApproval").style.display = 'none';
  document.getElementById("stepsBox").style.display = 'none';
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


