let skillsParentElement = document.querySelector("#skilllist");
let templateSkillHTML = document.querySelector("#skillname-to-be-replaced").outerHTML;
document.querySelector("#skillname-to-be-replaced").style.display = "none";

function createSkill() {
  let skillName = "skill-" + Namer.convertNameToKey(document.querySelector("#skillname").value);
  let char = "dex";//document.querySelector("#skillname-char").value;
  let base = 3;//parseInt(document.querySelector("#skillname-base").value);
  let cost = 2;//parseInt(document.querySelector("#skillname-cost").value);
  document.querySelector("#skillname").value = "";
  // Visible HTML stuff
  loadSkill(skillName);
  // Invisible backend stuff
  netdb.updateValue(skillName, 0);
  netdb.updateValue(skillName + "-char", char);
  netdb.updateValue(skillName + "-base", base);
  netdb.updateValue(skillName + "-cost", cost);
  // Even more invisible server-side backend stuff
  var req = new XMLHttpRequest();
  req.open("GET", "http://" + window.location.host + "/c/a/" + worldName + "/" + characterName + "/init-skill/" + skillName + "/" + char + "-" + base + "-" + cost);
  req.send();
}

function loadSkill(skillName) {
  skillsParentElement.innerHTML += templateSkillHTML
    .replace(/visible-skillname-to-be-replaced/g, Namer.convertKeyToName(skillName.substring(6)))
    .replace(/skillname-to-be-replaced/g, skillName);
}
