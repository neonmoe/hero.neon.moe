
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
