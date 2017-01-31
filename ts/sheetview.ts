import * as express from "express";
import {Universe} from "./universe";
import CharacterUtils from "./characterUtils";
import {Authentication} from "./authentication";

export module Sheetview {
  export function view(req: express.Request, res: express.Response) {
    let world = req.params.world;
    let name = req.params.name;
    let worldmissing = !Universe.worldExists(world);
    if (Universe.characterExists(world, name)) {
      let character = Universe.getCharacter(world, name);
      if (!Authentication.permission.reqHas(character.viewPL, req)) {
        res.render("403");
      } else {
        let edit = Authentication.permission.reqHas(character.editPL, req);
        res.render("sheet", {name: Universe.getCharacter(world, name).name, edit: edit});
      }
    } else {
      res.render("createcharacter", {
        name: name, world: world, pop: false,
        creation: true, worldmissing: worldmissing
      });
    }
  }

  export function action(req: express.Request, res: express.Response) {
    let world = req.params.world;
    let name = req.params.name;
    if (Universe.characterExists(world, name)) {
      let character = Universe.getCharacter(world, name);
      let netdb = character.database;
      switch (req.params.action) {
        case "update-stat":
          if (Authentication.permission.reqHas(character.editPL, req)) {
            let args = req.params.value.split("-");
            let stat = args[1];
            if (args[0] == "up") {
              CharacterUtils.increaseStat(netdb, stat);
            } else {
              CharacterUtils.decreaseStat(netdb, stat);
            }
            res.send("OK");
          }
          break;
        case "update-text-stat":
          if (Authentication.permission.reqHas(character.editPL, req)) {
            netdb.updateValue("textstat-" + req.params.value, req.get("Stat-Value").substring(0, CharacterUtils.getMaxTextLength(req.params.value)));
          }
          break;
        case "sync":
          if (Authentication.permission.reqHas(character.viewPL, req)) {
            let value = netdb.getNewValues(parseInt(req.params.value));
            res.send(value);
          }
          break;
      }
    }
  }
}
