import NetDB from "./netdb";
import CharacterUtils from "./characterUtils"

export default class Character {
  name: string;
  database: NetDB;

  constructor(name: string, database: NetDB = new NetDB()) {
    this.name = name;
    this.database = database;

    Object.keys(CharacterUtils.characteristicValues).forEach(stat => {
      this.database.updateValue(stat, 0);
    });
    this.database.updateValue("exp", 50);
    this.database.updateValue("current-end", 50);
    this.database.updateValue("current-body", 50);
    this.database.updateValue("current-stun", 50);
  }
}
