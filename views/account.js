
function changeHandle(oldToken) {
  createInputfieldPopup("Please enter your new handle", "Enter your new handle, or press cancel to exit",[
    {label: "Change", color: "+", closesPopup: true, func: (input) => {
      let request = new XMLHttpRequest();
      request.open("PUT", '/a/e/h/' + input, true);

      request.onload = e => {
        if (request.readyState === 4) {
          //alert("Your account is now created, here is your token: " + request.responseText + "\nDon't lose it, you can't get it back!");
          switch (request.status) {
            case 200:
              window.location.replace("/a");
              break;
            case 403:
              createButtonPopup("Handle taken", "", [{label: "Ok", color: "0", closesPopup: true, func: () => {}}])
              break;
            default:
              console.log("??")
              break;
          }

        }
      }

      request.send();
    }},
    {label: "Cancel", color: "0", closesPopup: true, func: () => {}}
  ], oldToken);
}

function createNewCharacter() {
  let request = new XMLHttpRequest();
  request.open("GET", '/u/wl/');

  request.onload = () => {


    if (request.readyState === 4 && request.status == 200) {
      let list = JSON.parse(request.response);
      if (list.length == 0) {
        createButtonPopup("No worlds to create character on", "", [{label: "Ok", color: "0", closesPopup: true, func: () => {}}])
      } else {
        createDropdownPopup("Select a world", "Select the world you want to create the character in.", [
          {label: "Select", color: "+", closesPopup: true, func: (world) => {
            let request = new XMLHttpRequest();
            request.open("GET", '/u/cc/' + world);
            request.onload = () => {
              if (request.readyState === 4 && request.status == 200) {

                if (JSON.parse(request.response)) { // If can create character
                  createInputfieldPopup("Select a name", "What shall your character be called?", [
                    {label: "Select", color: "+", closesPopup: true, func: (name) => {
                      let request = new XMLHttpRequest();
                      request.open("POST", `/u/nc/${world}/${name}`);
                      request.onload = () => {
                        if (request.readyState === 4) {
                          if (request.status == 200) {
                            window.location.replace(`/c/${world}/${name}`);
                          } else {
                            createButtonPopup("Oh no!",
                            "Something went horribly wrong! Abort!", [
                              {label: "Ok", color: "0", closesPopup: true, func: () => {}}])
                          }
                        }
                      }
                      request.send();
                    }},
                    {label: "Cancel", color: "0", closesPopup: true, func: () => {}}
                  ])
                } else {
                  createButtonPopup("Uh oh!", "You can't create a character here! Maybe the world is full?", [{label: "Ok", color: "0", closesPopup: true, func: () => {}}]);
                }


              }
            }
            request.send();
          }},
          {label: "Cancel", color: "0", closesPopup: true, func: () => {}}
        ], list);
      }
    }


  }

  request.send();
}
