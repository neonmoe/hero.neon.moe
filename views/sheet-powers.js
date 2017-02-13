
function updateOutputText(stack) {
  let output = "";
  stack.forEach(message => {
    if (message.channel !== undefined) { // ChatMessage
      output += `Chat message to ${message.channel}: ${message.message}`
    } else if (message.location !== undefined) { // Exception
      output += `Exception ${message.message} on ${message.location.join(":")}`;
    } else { // Log
      output += "LOG: " + message.message;
    }
    output += "\n";
  });
  let macro = document.getElementById("macro-output");
  macro.value = output;
}

function testMacro() {
  let macro = document.getElementById("power-macro");

  let request = new XMLHttpRequest();
  request.open('GET', '/o/e', true);
  request.setRequestHeader("Macro-Text", macro.value.replace(/\n/g, "\\n"));
  request.onload = e => {
    if (request.readyState === 4 && request.status === 200) {
      console.log(JSON.parse(request.response));
      updateOutputText(JSON.parse(request.response).stack);
    }
  }

  request.send();
}

function makeTestPowerFunctional() {
  let button = document.getElementById("run-macro");
  button.onclick = testMacro;
}

addOnLoad(makeTestPowerFunctional);
