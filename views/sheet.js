var addressParts = window.location.toString().substring(window.location.host.length + "http://".length).split("/");
var characterName = addressParts[3];
var worldName = addressParts[2];
console.log("Name: " + characterName + ", world: " + worldName);
var netdb = new NetDB();
update(0);

function updateFrontend() {
  Object.keys(netdb.values).forEach((stat) => {
    document.querySelectorAll(".points-for-" + stat).forEach((elem) => {
      elem.innerHTML = netdb.values[stat];
    });
    document.querySelectorAll(".values-for-" + stat).forEach((elem) => {
      elem.innerHTML = CharacterUtils.getValue(stat, netdb.values[stat]);
    });
    document.querySelectorAll(".roll-for-" + stat).forEach((elem) => {
      elem.innerHTML = CharacterUtils.getRoll(netdb.values[stat]);
    });
  });
}

function update(time) {
    var req = new XMLHttpRequest();
    req.addEventListener("load", _ => {
        netdb.updateValues(JSON.parse(req.response), time);
        updateFrontend();
    });
    req.open("GET", "http://" + window.location.host + "/e/" + worldName + "/" + characterName + "/sync/" + time);
    req.send();
}

window.setInterval(function (_) {
    update(NetDB.getTime());
}, 500);
