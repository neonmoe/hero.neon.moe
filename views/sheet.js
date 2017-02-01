var addressParts = window.location.toString().substring(window.location.host.length + "http://".length).split("/");
var characterName = addressParts[3].split("#")[0];
var worldName = addressParts[2];
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

function setTextStat(stat) {
  var req = new XMLHttpRequest();
  req.open("GET", "http://" + window.location.host + "/c/a/" + worldName + "/" + characterName + "/update-text-stat/" + stat);
  req.setRequestHeader("Stat-Value", document.querySelector("#textstat-" + stat).value.replace(/\n/g, "\\n"));
  req.send();
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
  updateFrontendForTextStats();
}

function updateFrontendForStat(stat) {
  updateClasses("points-for-" + stat, netdb.get(stat));
  updateClasses("value-for-" + stat, CharacterUtils.getValue(stat, netdb.get(stat)));
  if (CharacterUtils.characteristicValues[stat][3]) {
    updateClasses("roll-for-" + stat, CharacterUtils.getRoll(netdb.get(stat)));
  }
}

function updateFrontendForExp() {
  let totalExp = netdb.get("exp");
  let spentExp = CharacterUtils.getSpentExperience(netdb);
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

function updateFrontendForTextStats() {
  CharacterUtils.textStats.forEach(stat => {
    let elem = document.querySelector("#textstat-" + stat);
    elem.value = netdb.get("textstat-" + stat).replace(/\\n/g, "\n");
    elem.maxLength = CharacterUtils.getMaxTextLength(stat);
  });
}

function updateClasses(name, value) {
  document.querySelectorAll("." + name).forEach(elem => {
    elem.innerHTML = value;
  });
}

// Requesting stuff
let lastUsefulTime = NetDB.getTime();
function update(time) {
  let req = new XMLHttpRequest();
  req.addEventListener("load", _ => {
    let values = JSON.parse(req.response);
    netdb.updateValues(values, time);
    if (Object.keys(values).length > 0) {
      updateFrontend();
      lastUsefulTime = NetDB.getTime();
    }
  });
  req.open("GET", "http://" + window.location.host + "/c/a/" + worldName + "/" + characterName + "/sync/" + time);
  req.send();
}

let lastTime = NetDB.getTime();
function sync() {
  update(lastTime);
  lastTime = NetDB.getTime();
  let delayTime = 350;
  if (lastTime - lastUsefulTime > 20000) {
    delayTime = 2000;
  }
  window.setTimeout(sync, delayTime);
}
sync();
