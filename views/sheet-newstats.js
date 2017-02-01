let skillsParentElement = document.querySelector("#skilllist");
let templateSkillHTML = document.querySelector("#skillname-to-be-replaced").outerHTML;
document.querySelector("#skillname-to-be-replaced").style.display = "none";

function createSkill() {
  let skillName = "skill-" + Namer.convertNameToKey(document.querySelector("#skillname").value);
  let char = document.querySelector("#skillchar").value.toLowerCase();
  let base = parseInt(document.querySelector("#skillbase").value);
  let cost = parseInt(document.querySelector("#skillcost").value);
  document.querySelector("#skillname").value = "";
  document.querySelector("#skillbase").value = 0;
  document.querySelector("#skillcost").value = 0;
  console.log(skillName + ", " + char + ", " + base + ", " + cost);
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
