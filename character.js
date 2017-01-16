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

class Character {
  constructor(name) {
    this.name = name;
    this.identities = [name];
    this.playerName = name;
    this.characteristicPoints = {
      "str": 0, "dex": 0, "con": 0, "int": 0, "ego": 0, "pre": 0, "ocv": 0,
      "dcv": 0, "omcv": 0, "dmcv": 0, "spd": 0, "pd": 0, "ed": 0, "rec": 0,
      "end": 0, "body": 0, "stun": 0
    };
    this.stats = {
      "curend": this.getCharacteristicValue("end"),
      "curbody": this.getCharacteristicValue("body"),
      "curstun": this.getCharacteristicValue("stun"),
      "totalexp": 25,
    };
    console.log("Created a character named " + name + "!");
  }

  getCharacteristicValue(name) {
    let vals = characteristicValues[name];
    return Math.round(vals[0] + this.characteristicPoints[name] / vals[1] * vals[2]);
  }

  getHTHDamage() {
    // "Round" to halves
    return Math.floor((this.getCharacteristicValue("str") / 5) * 2) / 2;
  }

  getLiftWeight() {
    return strengthLiftValues[Math.max(0, Math.min(strengthLiftValues.length - 1, this.getCharacteristicValue("str")))];
  }

  spentExp() {
    let total = 0;
    Object.keys(this.characteristicPoints).forEach(key => total += this.characteristicPoints[key]);
    return total;
  }

  availablePoints() {
    return this.stats.totalexp - this.spentExp();
  }
}

class World {
  constructor() {
    this.characters = [ ];
    this.characternames = [ ];
    this.maxPopulation = 64;
  }

  characterExists(name) {
    return this.characternames.indexOf(name.toLowerCase()) != -1;
  }

  spaceInWorld() {
    return this.characters.length < this.maxPopulation;
  }

  createCharacter(name) {
    this.characters.push(new Character(name[0].toUpperCase() + name.substring(1)));
    this.characternames.push(name.toLowerCase());
  }

  getCharacter(name) {
    return this.characters[this.characternames.indexOf(name.toLowerCase())];
  }
}

let world = new World();
world.createCharacter("Beep");
world.createCharacter("Zuup");

module.exports = {
  display: (req, res) => {
    let charname = req.params.cid.toLowerCase();
    if (!world.characterExists(charname)) {
      if (!world.spaceInWorld()) {
        res.render("fullworld");
        return;
      }
      world.createCharacter(req.params.cid);
    }
    let character = world.getCharacter(charname);
    let sheet = {
      name: character.name,
    };
    res.render("sheet", sheet);
  },

  edit: (req, res) => {
    let charname = req.params.cid.toLowerCase();
    let response = "";
    if (world.characterExists(charname)) {
      let action = req.params.action;
      let stat = req.params.stat;
      let character = world.getCharacter(charname);
      if (Object.keys(characteristicValues).indexOf(stat) != -1) {
        let cost = characteristicValues[stat][1];
        switch (action) {
          case "up":
            if (character.availablePoints() >= cost) {
              character.characteristicPoints[stat] += cost;
            }
            break;
          case "down":
            character.characteristicPoints[stat] -= cost;
            if (character.getCharacteristicValue(stat) < 0) {
                character.characteristicPoints[stat] += cost;
            }
            break;
        }
        response = "" + character.characteristicPoints[stat];
      } else {
        if (stat == "spentexp") {
          response = "" + (character.stats.totalexp - character.availablePoints());
        } else if (stat == "unspentexp") {
          response = "" + character.availablePoints();
        } else if (stat == "hthdmg") {
          response = "" + character.getHTHDamage();
        } else if (stat == "liftwg") {
          response = "" + character.getLiftWeight();
        } else {
          response = "" + character.stats[stat];
        }
      }
    }
    res.send(response);
  },

  list: _ => {
    let characters = "";
    world.characters.forEach((c) => {
      characters += c.name + ", ";
    });
    return characters.substring(0, characters.length - 2) + ".";
  }
}
