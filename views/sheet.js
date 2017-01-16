// Constants for the characteristics' point spending [base value, min points, value per min points, rollable]
const characteristicValues = {
  "str": [10, 1, 1, true],
  "dex": [10, 2, 1, true],
  "con": [10, 1, 1, true],
  "int": [10, 1, 1, true],
  "ego": [10, 1, 1, true],
  "pre": [10, 1, 1, true],
  "ocv": [3, 5, 1, false],
  "dcv": [3, 5, 1, false],
  "omcv": [3, 3, 1, false],
  "dmcv": [3, 3, 1, false],
  "spd": [2, 10, 1, false],
  "pd": [2, 1, 1, false],
  "ed": [2, 1, 1, false],
  "rec": [4, 1, 1, false],
  "end": [20, 1, 5, false],
  "body": [10, 1, 1, false],
  "stun": [20, 1, 2, false]
};
const rollable = ["str", "dex", "con", "int", "ego", "pre"];
const strengthLiftValues = [0, 8, 16, 25, 38, 50, 50, 50, 75, 75, 100, 100,
  100, 150, 150, 200, 200, 200, 300, 300, 400, 400, 500, 600, 600, 800, 800,
  800, 1200, 1200, 1600, 1600, 1600, 1600, 1600, 3200, 3200, 3200, 3200,
  3200, 6400, 6400, 6400, 6400, 6400, 12500, 12500, 12500, 12500, 12500,
  25000, 25000, 25000, 25000, 25000, 50000, 50000, 50000, 50000, 50000,
  100000, 100000, 100000, 100000, 100000, 200000, 200000, 200000, 200000,
  200000, 400000, 400000, 400000, 400000, 400000, 800000, 800000, 800000,
  800000, 800000, 1600000, 1600000, 1600000, 1600000, 1600000, 3200000,
  3200000, 3200000, 3200000, 3200000, 6400000, 6400000, 6400000, 6400000,
  6400000, 12500000, 12500000, 12500000, 12500000, 12500000, 25000000,
  25000000, 25000000, 25000000];
let characterName = document.querySelector("#charactername").innerHTML;

let getCharacteristicValueFromPoints = (name, points) => {
  let vals = characteristicValues[name];
  return Math.round(vals[0] + points / vals[1] * vals[2]);
}

let increaseStat = (stat) => {
  operateStat(stat, parseInt(document.querySelector(".pts" + stat).innerHTML) + characteristicValues[stat][1]);
  requestUpdateStat(stat, "up");
};

let decreaseStat = (stat) => {
  operateStat(stat, parseInt(document.querySelector(".pts" + stat).innerHTML) - characteristicValues[stat][1]);
  requestUpdateStat(stat, "down");
};

let operateStat = (stat, newPoints) => {
  let newValue = getCharacteristicValueFromPoints(stat, newPoints);
  let newRoll = (9 + Math.floor(newValue / 5));
  document.querySelectorAll(".pts" + stat).forEach(e => e.innerHTML = newPoints);
  document.querySelectorAll(".val" + stat).forEach(e => e.innerHTML = newValue);
  document.querySelectorAll(".rol" + stat).forEach(e => { if (rollable.indexOf(stat) != -1) e.innerHTML = newRoll; });
}

let requestUpdateStat = (stat, action) => {
  let req = new XMLHttpRequest();
  let listener = () => {
    operateStat(stat, req.response);
  };
  req.addEventListener("load", listener);
  req.open("PUT", "http://" + window.location.host + "/e/" + characterName + "/" + action + "/" + stat);
  req.send();
};

Object.keys(characteristicValues).forEach((stat) => {
  requestUpdateStat(stat, "boop")
});
