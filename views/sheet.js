var addressParts = window.location.toString().substring(window.location.host.length + "http://".length).split("/");
var characterName = addressParts[3].split("#")[0];
var worldName = addressParts[2];
var netdb = new NetDB();
update(0);

// Interaction stuff
function increaseStat(stat) {
  var req = new XMLHttpRequest();
  req.open("GET", "http://" + window.location.host + "/c/a/" + worldName + "/" + characterName + "/update-stat/up/" + stat);
  req.send();
  CharacterUtils.increaseStat(netdb, stat);
  updateFrontend([stat]);
}

function decreaseStat(stat) {
  var req = new XMLHttpRequest();
  req.open("GET", "http://" + window.location.host + "/c/a/" + worldName + "/" + characterName + "/update-stat/dn/" + stat);
  req.send();
  CharacterUtils.decreaseStat(netdb, stat);
  updateFrontend([stat]);
}

function setTextStat(stat) {
  var req = new XMLHttpRequest();
  req.open("GET", "http://" + window.location.host + "/c/a/" + worldName + "/" + characterName + "/update-text-stat/" + stat);
  req.setRequestHeader("Stat-Value", document.querySelector("#textstat-" + stat).value.replace(/\n/g, "\\n"));
  req.send();
}

// Frontend stuff
function updateFrontend(changedStats) {
  let statsUpdated = changedStats.filter(c => Object.keys(CharacterUtils.characteristicValues).indexOf(c) != -1).length > 0;
  // The .subtring(8) part is there to cut off the "current-" part.
  let statusUpdated = changedStats.filter(c => CharacterUtils.statusCharacteristics.indexOf(c.substring(8)) != -1).length > 0;
  // The .subtring(9) part is there to cut off the "textstat-" part.
  let textUpdated = changedStats.filter(c => CharacterUtils.textStats.indexOf(c.substring(9)) != -1).length > 0;
  let skillsUpdated = changedStats.filter(c => CharacterUtils.isSkill(c)).length > 0;

  if (statsUpdated) {
    Object.keys(CharacterUtils.characteristicValues).forEach((stat) => {
      if (Object.keys(netdb.values).indexOf(stat) != -1 && changedStats.indexOf(stat) != -1) {
        updateFrontendForStat(stat);
      }
    });
    if (changedStats.indexOf("str") != -1) {
      updateFrontendForStr();
    }
  }
  if (statsUpdated || skillsUpdated || changedStats.indexOf("exp") != -1) {
    updateFrontendForExp();
  }
  if (statusUpdated) {
    updateFrontendForStatus();
  }
  if (textUpdated) {
    updateFrontendForTextStats();
  }
  if (statsUpdated || skillsUpdated) {
    updateFrontendForSkills(changedStats.filter(c => CharacterUtils.isSkill(c)));
  }
}

function updateFrontendForStat(stat) {
  updateClasses("points-for-" + stat, netdb.get(stat));
  updateClasses("value-for-" + stat, CharacterUtils.getValue(stat, netdb.get(stat)));
  if (CharacterUtils.characteristicValues[stat][3]) {
    updateClasses("roll-for-" + stat, CharacterUtils.getRoll(netdb, stat));
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
  document.querySelector("#charactername").innerHTML = document.querySelector("#textstat-charactername").value;
}

function updateFrontendForSkills(skills) {
  skills.forEach(skill => {
    if (!document.querySelector("#" + skill)) {
      loadSkill(skill);
    }
    updateClasses("points-for-" + skill, netdb.get(skill));
    updateClasses("roll-for-" + skill, CharacterUtils.getRoll(netdb, skill));
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
      updateFrontend(Object.keys(values));
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
