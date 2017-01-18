
function changeHandle(oldToken) {
  let answer = prompt("Please enter your new handle (or cancel to exit)", oldToken);

  if (answer) {
    let request = new XMLHttpRequest();
    request.open("PUT", '/a/e/h/' + answer, true);

    request.onload = e => {
      if (request.readyState === 4) {
        //alert("Your account is now created, here is your token: " + request.responseText + "\nDon't lose it, you can't get it back!");
        switch (request.status) {
          case 200:
            window.location.replace("/a");
            break;
          case 403:
            alert(request.responseText);
            break;
          default:
            console.log("??")
            break;
        }

      }
    }

    request.send();
  }
}
