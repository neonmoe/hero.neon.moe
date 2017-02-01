import NetDB from "./netdb";
import CharacterUtils from "./characterUtils"
import {Authentication} from "./authentication";
import {FileReadWrite} from "./fileRW";

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
    CharacterUtils.statusCharacteristics.forEach(stat => {
      this.database.updateValue("current-" + stat, CharacterUtils.getValue(stat, database.get(stat)));
    });
    CharacterUtils.textStats.forEach(stat => {
      let value = "";
      if (stat == "charactername") {
        value = name;
      }
      this.database.updateValue("textstat-" + stat, value);
    });
  }

  save(): {[key: string]: any} {
    let savedata: {[key: string]: any} = {};
    savedata["name"] = this.name;
    savedata["viewPL"] = this.viewPL;
    savedata["editPL"] = this.editPL;
    savedata["database"] = this.database.save();

    return savedata;
  }

  static load(data: {[key: string]: any}): Character {
    let character = new Character(data["name"]);
    character.viewPL = data["viewPL"];
    character.editPL = data["editPL"];
    character.database = NetDB.load(data["database"]);

    return character;;
  }
}
