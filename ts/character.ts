import NetDB from "./netdb";
import CharacterUtils from "./characterUtils"
import {Authentication} from "./authentication";

export default class Character {
  name: string;
  database: NetDB;
  viewPL: number;
  editPL: number;

  constructor(name: string, database: NetDB = new NetDB()) {
    this.name = name;
    this.database = database;
    this.viewPL = Authentication.permission.new(name + " view");
    this.editPL = Authentication.permission.new(name + " edit");

    Object.keys(CharacterUtils.characteristicValues).forEach(stat => {
      this.database.updateValue(stat, 0);
    });
    this.database.updateValue("exp", 50);
    this.database.updateValue("current-end", 50);
    this.database.updateValue("current-body", 50);
    this.database.updateValue("current-stun", 50);
  }
}
