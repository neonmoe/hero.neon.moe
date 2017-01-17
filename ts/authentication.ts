export module Authentication {
  const chars = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'a', 'b', 'c', 'd', 'e', 'f'];

  class User {
    token: string;
    constructor(token) {
      this.token = token;
      console.log("New user has been generated!");
    }
  }

  class UserDatabase {
    users: {[key: string]: User};
    constructor() {
      this.users = { }
    }

    generateNewUser() {
      let token;
      do {
        token = Array.apply(null, new Array(10)).map(c => chars[Math.floor(Math.random() * chars.length)]).join('');
      } while (token in this.users)

      let user = new User(token);
      this.users[token] = user;
      return token;
    }

    userExists(token) {
      return token in this.users;
    }
  }

  const userDatabase = new UserDatabase();

  class PermissionList {
    permittedTokens: Array<String>;
    constructor() {
      this.permittedTokens = [ ];
    }

    hasAccess(token) {
      return this.permittedTokens.indexOf(token) >= 0;
    }

    givePermission(token) {
      if (!this.hasAccess(token)) {
        this.permittedTokens.push(token);
      }
    }

    revokePermission(token) {
      if (this.hasAccess(token)) {
        this.permittedTokens.splice(this.permittedTokens.indexOf(token), 1);
      }
    }
  }

  export function generateUser(req, res) {
    let token = userDatabase.generateNewUser();
    res.cookie('authtoken', token, {expires: new Date(Date.now() + 31536000000)});
    res.send(token);
  }

  export function view(req, res) {
    let authtoken = getAuthtoken(req);
    if (authtoken in userDatabase.users) {
      res.render("account", {token: authtoken});
    } else {
      res.redirect("/");
    }
  }

  export function getAuthtoken(req) {
    let authtoken;

    if (req.headers.cookie == undefined) { return authtoken; }

    let cookies = req.headers.cookie.split("; ");
    for (let i in cookies) {
      let cookie = cookies[i].split("=");
      if (cookie[0] == "authtoken" && cookie[1] in userDatabase.users) {
        authtoken = cookie[1];
      }
    }
    return authtoken;
  }
}
