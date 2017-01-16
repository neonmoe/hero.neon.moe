var express = require("express");
var app = express();

app.set("view engine", "pug");

app.get("/", function(req, res, next) {
    res.render("index", {title: "RPG Sheet Manager", header: "RPG Sheet Manager for HERO-likes", description: "This HERO-like RPG sheet manager is still under construction."});
});

app.listen(8863, function() {
    console.log("Listening to port 8863...");
});
