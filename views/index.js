
function genuser() {
  let request = new XMLHttpRequest();
  request.open('POST', '/a/generate', true);
  request.onload = e => {
    if (request.readyState === 4 && request.status === 200) {
      //alert("Your account is now created, here is your token: " + request.responseText + "\nDon't lose it, you can't get it back!");
      window.location.replace("/a");
    }
  }
  request.onerror = e => {
    alert("Generating account failed!")
  }

  request.send();
}
