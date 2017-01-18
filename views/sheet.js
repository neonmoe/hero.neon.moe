var addressParts = window.location.toString().substring(window.location.host.length + "http://".length).split("/");
var characterName = addressParts[3];
var worldName = addressParts[2];
console.log("Name: " + characterName + ", world: " + worldName);
var netdb = new NetDB();
update(0);

function updateFrontend() {
  Object.keys(CharacterUtils.characteristicValues).forEach((stat) => {
    if (Object.keys(netdb.values).indexOf(stat) != -1) {
      updateClasses("points-for-" + stat, netdb.get(stat));
      updateClasses("value-for-" + stat, CharacterUtils.getValue(stat, netdb.get(stat)));
      updateClasses("roll-for-" + stat, CharacterUtils.getRoll(netdb.get(stat)));
    }
  });

  let totalExp = netdb.get("exp");
  let spentExp = CharacterUtils.getSpentExperience(netdb.values);
  console.log("Total exp: " + totalExp);
  console.log("Spent exp: " + spentExp);
  updateClasses("total-exp", totalExp);
  updateClasses("spent-exp", spentExp);
  updateClasses("unspent-exp", totalExp - spentExp);

  updateClasses("hand-to-hand-dmg", CharacterUtils.getHTHDmg(netdb.get("str")));
  updateClasses("lift-weight", CharacterUtils.getLift(netdb.get("str")));

  // NOTE: These seem very automatable, consider in future if more values like these pop up
  updateClasses("current-end", netdb.get("current-end"));
  updateClasses("current-body", netdb.get("current-body"));
  updateClasses("current-stun", netdb.get("current-stun"));
}

function updateClasses(name, value) {
  document.querySelectorAll("." + name).forEach(elem => {
    elem.innerHTML = value;
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
}, 5000);
