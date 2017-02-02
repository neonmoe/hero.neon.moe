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
      let val = req.params.value;
      let val1 = req.params.value1;
      switch (req.params.action) {
        case "update-stat":
          if (Authentication.permission.reqHas(character.editPL, req)) {
            if (val == "up") {
              CharacterUtils.increaseStat(netdb, val1);
            } else {
              CharacterUtils.decreaseStat(netdb, val1);
            }
            res.send("OK");
          }
          break;
        case "update-text-stat":
          if (Authentication.permission.reqHas(character.editPL, req)) {
            netdb.updateValue("textstat-" + val, req.get("Stat-Value").substring(0, CharacterUtils.getMaxTextLength(val)));
          }
          break;
        case "init-skill":
          if (Authentication.permission.reqHas(character.editPL, req)) {
            let skillProps = val1.split("-");
            netdb.updateValue(val, 0);
            netdb.updateValue(val + "-char", skillProps[0]);
            netdb.updateValue(val + "-base", skillProps[1]);
            netdb.updateValue(val + "-cost", skillProps[2]);
          }
          break;
        case "remove-skill":
          if (Authentication.permission.reqHas(character.editPL, req)) {
            netdb.removeValue(val);
            netdb.removeValue(val + "-char");
            netdb.removeValue(val + "-base");
            netdb.removeValue(val + "-cost");
            res.sendStatus(200);
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
