class Character {
  constructor(name) {
    this.name = name;
    this.subjectpronoun = "she";
    this.objectpronoun = "her";
    this.str = 10;
    this.dex = 10;
    this.int = 10;
    console.log("Created a character named " + name + "!");
  }
}

class World {
  constructor() {
    this.characters = [ ];
    this.characternames = [ ];
  }

  characterExists(name) {
    return this.characters.map(c => c.name).indexOf(name) != -1;
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
    let msg = "a newborn";
    if (world.characterExists(charname)) {
      msg = "a veteran";
    } else {
      world.createCharacter(req.params.cid);
    }
    let character = world.getCharacter(charname);
    res.render("sheet", {
      name: character.name,
      pronoun: character.pronoun[0].toUpperCase() + character.pronoun.substring(1),
      str: character.str,
      dex: character.dex,
      int: character.int,
    });
  },

  edit: (req, res) => {
    let charname = req.params.cid.toLowerCase();
    if (world.characterExists(charname)) {
      let action = req.params.action;
      let character = world.getCharacter(charname);
      switch (action) {
        case "gender":
          character.subjectpronoun = character.subjectpronoun == "she" ? "he" : "she";
          character.objectpronoun = character.objectpronoun == "her" ? "him" : "her";
          break;
        case "strup":
          character.str += 1;
          break;
        case "strdown":
          character.str -= 1;
          break;
        case "dexup":
          character.dex += 1;
          break;
        case "dexdown":
          character.dex -= 1;
          break;
        case "intup":
          character.int += 1;
          break;
        case "intdown":
          character.int -= 1;
          break;
      }
    }
    res.redirect("/c/" + charname);
  },

  list: _ => {
    let characters = "";
    world.characters.forEach((c) => {
      characters += c.name + ", whose strength is " + c.str + ", " + c.objectpronoun + " dexterity " + c.dex + ", and " + c.objectpronoun + " intelligence " + c.int + ". ";
    });
    return characters;
  }
}
