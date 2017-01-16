const express = require("express");
const app = express();
const character = require("./character.js");
const path = require("path");

app.set("view engine", "pug");

app.get("/", (req, res) => {
  res.render("index", {
    title: "RPG Sheet Manager",
    header: "RPG Sheet Manager for HERO-likes",
    description: "This HERO-like RPG sheet manager is still under construction.",
    charlist: character.list()
  });
});

app.get("/v/:cid", character.view);
app.get("/c/:cid", character.create);
app.get("/c/:cid/:confirm", character.create);
app.put("/e/:cid/:action/:stat", character.edit);

app.get("/emojifont", (req, res) => {
   res.sendFile(path.resolve("./") + "/views/emojione-svg.woff2");
});

app.get("/*", (req, res) => {
  res.render("404", {});
});

app.listen(8863, _ => {
    console.log("Listening to port 8863...");
});
