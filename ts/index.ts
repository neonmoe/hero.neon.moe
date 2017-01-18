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


app.get("/c/:world/:name", Sheetview.view);
app.get("/n/:world/:name", Sheetview.create);
app.put("/e/:world/:name/:action/:stat", Sheetview.edit);
app.get("/a", Authentication.view);
app.post("/a/generate", Authentication.generateUser);

app.get("/emojifont", (req, res) => {
   res.sendFile(path.resolve("./") + "/views/emojione-svg.woff2");
});

app.get("/*", (req, res) => {
  res.render("404", {});
});

app.listen(8863, _ => {
  console.log("--- hero.neon.moe init ---");
  Universe.createWorld("DBL");
  Universe.createCharacter("DBL", "Bob");
  console.log("--- hero.neon.moe init over ---");
  console.log("Ready to rock and roll on port 8863!");
});
