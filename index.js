const express = require("express");
const app = express();
const character = require("./character.js");

app.set("view engine", "pug");

app.get("/", (req, res) => {
  res.render("index", {
    title: "RPG Sheet Manager",
    header: "RPG Sheet Manager for HERO-likes",
    description: "This HERO-like RPG sheet manager is still under construction."
  });
});

app.get("/c/:cid", character.display);
app.get("/e/:cid/:action", character.edit);

app.listen(8863, _ => {
    console.log("Listening to port 8863...");
});
