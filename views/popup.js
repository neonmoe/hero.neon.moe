function _createGenericPopup(title, text, buttons, getArg) {
  let template = document.getElementById("popup-template");
  let popup = template.cloneNode(true);
  popup.querySelector(".popup-title").innerHTML = title;
  popup.querySelector(".popup-text").innerHTML = text;
  for (let i in buttons) {
    let button = buttons[i]
    let className = "";
    if (button.color == "+") {
      className = "positive"
    } else if (button.color == "-") {
      className = "negative"
    }

    let buttonElem = document.createElement("button");
    buttonElem.innerHTML = button.label;
    buttonElem.className = className;
    buttonElem.onclick = () => {
      button.func(getArg());
      if (button.closesPopup) {
        popup.remove();
      }
    };
    popup.querySelector(".popup-inputarea").appendChild(buttonElem);
  }
  popup.style.display = "block";
  return popup;
}

function createButtonPopup(title, text, buttons) {
  let popup = _createGenericPopup(title, text, buttons, () => { return undefined; });
  document.body.appendChild(popup);
}

function createInputfieldPopup(title, text, buttons, defval) {
  defval = defval || "";
  let inputfield = document.createElement("input");
  inputfield.setAttribute("type", "text");
  inputfield.className = "popup-textinput";
  inputfield.value = defval;
  let popup = _createGenericPopup(title, text, buttons, () => { return inputfield.value });
  popup.querySelector(".popup-inputarea").insertBefore(inputfield, popup.querySelector(".popup-inputarea").firstChild);
  document.body.appendChild(popup);
}

function createDropdownPopup(title, text, buttons, options) {
  let dropdown = document.createElement("select");
  dropdown.className = "popup-dropdown";
  for (let i in options) {
    let option = options[i];
    let optionElem = document.createElement("option");
    optionElem.innerHTML = option;
    optionElem.setAttribute("value", option);
    dropdown.appendChild(optionElem);
  }
  let popup = _createGenericPopup(title, text, buttons, () => { return dropdown.value });
  popup.querySelector(".popup-inputarea").insertBefore(dropdown, popup.querySelector(".popup-inputarea").firstChild);
  document.body.appendChild(popup);
}
