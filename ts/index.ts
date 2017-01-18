import * as express from "express";
import * as path from "path";
import {Authentication} from "./authentication";
import {Sheetview} from "./sheetview";
import {Universe} from "./universe"

const app = express();

app.set("view engine", "pug");

app.get("/", (req, res) => {
  res.render("index", {
    authorized: Authentication.getAuthtoken(req) !== undefined
  });
});


app.get("/c/:world/:name", Sheetview.view); // View a character :name in :world
app.get("/n/:world/:name", Sheetview.create); // Create character :name to :world
app.put("/e/:world/:name/:action/:stat", Sheetview.edit); // Edit character :name's :stat in :world by :action
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

app.listen(8863, _ => {
  console.log("Firing up hero.neon.moe...");
  Universe.createWorld("DBL");
  Universe.createCharacter("DBL", "Bob");
  console.log("Ready to rock and roll on port 8863!");
});
