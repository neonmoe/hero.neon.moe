let data = {
  saved_names: ["saved"]
}
module.exports = {
  display: (req, res, next) => {
    let msg = "Not found!";
    if (data.saved_names.indexOf(req.params.cid) != -1) {
      msg = "Found " + req.params.cid;
    } else {
      data.saved_names.push(req.params.cid);
    }
    res.render("index", {
      title: "RPG Sheet Manager",
      header: "RPG Character Sheet Manager for HERO-likes",
      description: "Character is still under construction. " + msg + " (Saved names: " + data.saved_names + ")"
    });
  }
}
