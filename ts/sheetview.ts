import * as express from "express";
import {Universe} from "./universe";

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

  export function edit(req: express.Request, res: express.Response) {
    let world = req.params.world;
    let name = req.params.name;
    if (Universe.characterExists(world, name)) {
      if (req.params.action == "sync") {
        let value = Universe.getCharacter(world, name).database.getNewValues(parseInt(req.params.value));
        res.send(value);
      }
    }
  }
}
