import * as express from "express";
import {Universe} from "./universe";
import CharacterUtils from "./characterUtils";

export module Sheetview {
  export function view(req: express.Request, res: express.Response) {
    let world = req.params.world;
    let name = req.params.name;
    let worldmissing = !Universe.worldExists(world);
    if (Universe.characterExists(world, name)) {
      res.render("sheet", {name: name});
    } else {
      res.render("createcharacter", {
        name: name, world: world, pop: false,
        creation: true, worldmissing: worldmissing
      });
    }
  }

  export function create(req: express.Request, res: express.Response) {
    let world = req.params.world;
    let name = req.params.name;
    let worldmissing = !Universe.worldExists(world);
    if (!Universe.createCharacter(world, name)) {
      res.render("createcharacter", {
        name: name, world: world, popLimit: true,
        creation: false, worldmissing: worldmissing
      });
    } else {
      res.redirect("/c/" + world + "/" + name);
    }
  }

  export function action(req: express.Request, res: express.Response) {
    let world = req.params.world;
    let name = req.params.name;
    if (Universe.characterExists(world, name)) {
      let netdb = Universe.getCharacter(world, name).database;
      switch (req.params.action) {
        case "update-stat":
          let args = req.params.value.split("-");
          let stat = args[1];
          if (args[0] == "up") {
            CharacterUtils.increaseStat(netdb, stat);
          } else {
            CharacterUtils.decreaseStat(netdb, stat);
          }
          res.send("OK");
          break;
        case "sync":
          let value = netdb.getNewValues(parseInt(req.params.value));
          res.send(value);
          break;
      }
    }
  }
}
