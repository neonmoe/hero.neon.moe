// Constants for the characteristics' point spending [base value, min points, value per min points]
const characteristicValues = {
  "str": [10, 1, 1],
  "dex": [10, 2, 1],
  "con": [10, 1, 1],
  "int": [10, 1, 1],
  "ego": [10, 1, 1],
  "pre": [10, 1, 1],
  "ocv": [3, 5, 1],
  "dcv": [3, 5, 1],
  "omcv": [3, 3, 1],
  "dmcv": [3, 3, 1],
  "spd": [2, 10, 1],
  "pd": [2, 1, 1],
  "ed": [2, 1, 1],
  "rec": [4, 1, 1],
  "end": [20, 1, 5],
  "body": [10, 1, 1],
  "stun": [20, 1, 2]
};

class Character {
  constructor(name) {
    this.name = name;
    this.identities = [ name ];
    this.playerName = name;
    this.characteristicPoints = {
      "str": 0, "dex": 0, "con": 0, "int": 0, "ego": 0, "pre": 0, "ocv": 0,
      "dcv": 0, "omcv": 0, "dmcv": 0, "spd": 0, "pd": 0, "ed": 0, "rec": 0,
      "end": 0, "body": 0, "stun": 0
    };
    this.status = {
      end: this.getCharacteristicValue("end"),
      body: this.getCharacteristicValue("body"),
      stun: this.getCharacteristicValue("stun"),
    };
    this.experience = 25;
    console.log("Created a character named " + name + "!");
  }

  getCharacteristicValue(name) {
    let vals = characteristicValues[name];
    return vals[0] + this.characteristicPoints[name] / vals[1] * vals[2];
  }
}

class World {
  constructor() {
    this.characters = [ ];
    this.characternames = [ ];
    this.maxPopulation = 5;
  }

  characterExists(name) {
    return this.characternames.indexOf(name.toLowerCase()) != -1;
  }

  spaceInWorld() {
    return this.characters.length < this.maxPopulation;
  }

  createCharacter(name) {
    this.characters.push(new Character(name));
    this.characternames.push(name.toLowerCase());
  }

  getCharacter(name) {
    return this.characters[this.characternames.indexOf(name)];
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
    Object.keys(characteristicValues).forEach((c) => {
      sheet["val" + c] = character.getCharacteristicValue(c);
      sheet["pts" + c] = character.characteristicPoints[c];
      sheet["rol" + c] = (9 + Math.floor(character.getCharacteristicValue(c) / 5)) + "-";
    });
    res.render("sheet", sheet);
  },

  edit: (req, res) => {
    let charname = req.params.cid.toLowerCase();
    if (world.characterExists(charname)) {
      let action = req.params.action;
      let stat = req.params.stat;
      let character = world.getCharacter(charname);
      switch (action) {
        case "up":
          character.characteristicPoints[stat]++;
          break;
        case "down":
          character.characteristicPoints[stat]--;
          break;
      }
    }
    res.redirect("/c/" + charname);
  },

  list: _ => {
    let characters = "";
    world.characters.forEach((c) => {
      characters += c.name + ", ";
    });
    return characters.substring(0, characters.length - 2) + ".";
  }
}
