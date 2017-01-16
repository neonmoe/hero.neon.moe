
var chars = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'a', 'b', 'c', 'd', 'e', 'f'];

class User {
  constructor(token) {
    this.token = token;

    console.log("New user has been generated!");
  }
}

class UserDatabase {
  constructor() {
    this.users = { }
  }

  generateNewUser() {
    let token;
    do {
      token = new Array(10).fill('').map(c =>
        chars[Math.floor(Math.random() * chars.length)]).join('');
      } while (token in this.users)

      let user = new User(token);
      this.users[token] = user;
      return token;
    }

    userExists(token) {
      return token in this.users;
    }
  }

  var userDatabase = new UserDatabase();

  function getAuthtoken(req) {
    let authtoken = "";

    if (req.headers.cookie == undefined) { return authtoken; }

    let cookies = req.headers.cookie.split("; ");
    for (let i in cookies) {
      let cookie = cookies[i].split("=");
      if (cookie[0] == "authtoken") {
        authtoken = cookie[1];
      }
    }
    return authtoken;
  }

  module.exports = {
    generateUser: (req, res) => {
      let token = userDatabase.generateNewUser();
      res.cookie('authtoken', token);
      res.send(token);
    },
    view: (req, res) => {
      let authtoken = getAuthtoken(req)
      if (authtoken in userDatabase.users) {
        res.render("account", {token: authtoken});
      } else {
        res.redirect("/");
      }
    },
    getAuthtoken: (req) => {
      return getAuthtoken(req) in userDatabase.users;
    }
  }
