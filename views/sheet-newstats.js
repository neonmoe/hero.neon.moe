let skillsParentElement = document.querySelector("#skilllist");
let templateSkillHTML = document.querySelector("#exampleskill").outerHTML;
document.querySelector("#exampleskill").style.display = "none";

function createSkill() {
  let skillName = "skill-" + Namer.convertNameToKey(document.querySelector("#skillname").value);
  // Visible HTML stuff
  skillsParentElement.innerHTML += templateSkillHTML.replace(/skillname-to-be-replaced/g, skillName);
  // Invisible backend stuff
  netdb.initializeKey(skillName);
  // Even more invisible server-side backend stuff
  var req = new XMLHttpRequest();
  req.open("GET", "http://" + window.location.host + "/c/a/" + worldName + "/" + characterName + "/init-stat/" + skillName);
  req.send();
}
