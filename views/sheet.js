var addressParts = window.location.toString().substring(window.location.host.length + "http://".length).split("/");
var characterName = addressParts[3];
var worldName = addressParts[2];
console.log("Name: " + characterName + ", world: " + worldName);
var netdb = new NetDB();
update(0);

// Interaction stuff
function increaseStat(stat) {
  var req = new XMLHttpRequest();
  req.open("GET", "http://" + window.location.host + "/c/a/" + worldName + "/" + characterName + "/update-stat/up-" + stat);
  req.send();
  CharacterUtils.increaseStat(netdb, stat);
  updateFrontendForStat(stat);
  updateFrontendForExp();
  if (stat == "str") {
    updateFrontendForStr();
  } else if (CharacterUtils.statusCharacteristics.indexOf("stat") != -1) {
    updateFrontendForStatus();
  }
}

function decreaseStat(stat) {
  var req = new XMLHttpRequest();
  req.open("GET", "http://" + window.location.host + "/c/a/" + worldName + "/" + characterName + "/update-stat/dn-" + stat);
  req.send();
  CharacterUtils.decreaseStat(netdb, stat);
  updateFrontendForStat(stat);
  updateFrontendForExp();
  if (stat == "str") {
    updateFrontendForStr();
  } else if (CharacterUtils.statusCharacteristics.indexOf("stat") != -1) {
    updateFrontendForStatus();
  }
}

// Frontend stuff
function updateFrontend() {
  Object.keys(CharacterUtils.characteristicValues).forEach((stat) => {
    if (Object.keys(netdb.values).indexOf(stat) != -1) {
      updateFrontendForStat(stat);
    }
  });
  updateFrontendForExp();
  updateFrontendForStr();
  updateFrontendForStatus();
}

function updateFrontendForStat(stat) {
  updateClasses("points-for-" + stat, netdb.get(stat));
  updateClasses("value-for-" + stat, CharacterUtils.getValue(stat, netdb.get(stat)));
  updateClasses("roll-for-" + stat, CharacterUtils.getRoll(netdb.get(stat)));
}

function updateFrontendForExp() {
  let totalExp = netdb.get("exp");
  let spentExp = CharacterUtils.getSpentExperience(netdb);
  console.log("Total exp: " + totalExp);
  console.log("Spent exp: " + spentExp);
  updateClasses("total-exp", totalExp);
  updateClasses("spent-exp", spentExp);
  updateClasses("unspent-exp", totalExp - spentExp);
}

function updateFrontendForStr() {
  updateClasses("hand-to-hand-dmg", CharacterUtils.getHTHDmg(netdb.get("str")));
  updateClasses("lift-weight", CharacterUtils.getLift(netdb.get("str")));
}

function updateFrontendForStatus() {
  CharacterUtils.statusCharacteristics.forEach(stat => {
    updateClasses("current-" + stat, netdb.get("current-" + stat));
  });
}

function updateClasses(name, value) {
  document.querySelectorAll("." + name).forEach(elem => {
    elem.innerHTML = value;
  });
}

// Requesting stuff
function update(time) {
  var req = new XMLHttpRequest();
  req.addEventListener("load", _ => {
    netdb.updateValues(JSON.parse(req.response), time);
    updateFrontend();
  });
  req.open("GET", "http://" + window.location.host + "/c/a/" + worldName + "/" + characterName + "/sync/" + time);
  req.send();
}

window.setInterval(function (_) {
  update(NetDB.getTime());
}, 5000);
