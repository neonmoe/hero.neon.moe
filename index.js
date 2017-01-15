var express = require("express");
var app = express();

app.get("/*", function(req, res, next) {
    res.send("This HERO-like RPG sheet manager is still under construction.");
});

app.listen(8863, function() {
    console.log("Listening to port 8863...");
});
