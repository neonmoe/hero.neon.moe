import * as express from "express";
import * as path from "path";

import {Authentication} from "./authentication";
import {Sheetview} from "./sheetview";
import {Universe} from "./universe";
import {Commander} from "./commander";
import {FileReadWrite} from "./fileRW";

const app = express();

app.set("view engine", "pug");
app.disable("etag");

app.get("/", (req, res) => {
  res.render("index", {
    authorized: Authentication.getAuthtoken(req) !== undefined
  });
});

app.get("/c/:world/:name", Sheetview.view); // View a character :name in :world
app.get("/c/a/:world/:name/:action/:value", Sheetview.action); // Do :action for :name in :world with :value
app.get("/u/wl/", Universe.tellWorldsToReq); // Universe, WorldList
app.get("/u/cc/:world", Universe.canCreateCharacter) // Universe, CanCreate (Character)
app.post("/u/nc/:world/:name", Universe.createCharacterOnRequest); // Universe, NewCharacter
app.post("/a/generate", Authentication.generateUser); // Generate a new account
app.get("/a", Authentication.view); // View current account
app.get("/a/:handle", Authentication.view); // View account at :handle
app.get("/a/:handle/public", Authentication.viewPublic); // View account's public page at :handle
app.put("/a/e/h/:handle", Authentication.editHandle); // /account/edit/handle (Edit account handle)

app.get("/emojifont", (req, res) => {
   res.sendFile(path.resolve("./") + "/views/emojione-svg.woff2");
});

app.get("/*", (req, res) => {
  res.render("404", {});
});

// Test/example command
Commander.registerCommand("log", (args: Commander.Arguments) => {
  console.log("test");

  let output = args.getAsString();

  // Uppercase the output possibly
  if (args.get("uppercase")) {
    output = output.toUpperCase();
  }

  // Set the category
  let category = args.getAsString("category");
  if (category.length > 0) {
    output = "[" + category.toUpperCase() + "] " + output;
  } else {
    output = "[LOG] " + output;
  }

  // Display the message
  console.log(output);
});
Commander.registerCommand("backup", FileReadWrite.backupCmd);
Commander.registerCommand("load", FileReadWrite.backupLoadCmd);

app.listen(8863, _ => {
  console.log("Firing up hero.neon.moe...");
  Universe.createWorld("Heaven");
  Universe.createCharacter("Heaven", "Jesus", "God");
  console.log("Ready to rock and roll on port 8863!");
  Commander.startListening();
});
