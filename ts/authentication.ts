export module Authentication {
  const chars = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'a', 'b', 'c', 'd', 'e', 'f'];
  const rndWrds = {
    adje:
      ['annoying', 'hairy', 'gross', 'funny','dark',
      'sloppy', 'slippy', 'fat', 'slim', 'yellow', 'blue', 'red',
      'green', 'complex', 'smart', 'dumb', 'late', 'early', 'tall', 'long',
      'caffeinated'],
    verb: [
      'jumping',  'speaking', 'yelling', 'levitating', 'raging',
      'shaking', 'booping', 'running', 'walking', 'coding', 'galloping',
      'cantering', 'trotting', 'sitting', 'standing', 'h4x0r1ng'],
    noun:
      ['banana', 'monkey', 'gorilla', 'giraffe', 'zebra', 'donkey',
      'computer', 'hat', 'tophat', 'phone', 'table', 'human', 'sofa',
      'badger', 'snake', 'orange', 'apple', 'dog', 'cat', 'chimpanzee']
  };

  class User {

    token: string;
    handle: string;

    constructor(token, handle) {
      this.token = token;
      this.handle = handle;
      console.log(`User ${handle} has been generated with token ${token}!`);
    }

    getProperty() {
      return {
        worlds: ["test"],
        characters: [{name: "bob", world: "dbl"}, {name: "beb", world: "dbl"}],
        images: ["joku.png"],
        audio: ["musa.mp4"]
      };
    }
  }

  class UserDatabase {

    users: {[key: string]: User};
    handles: {[key: string]: string} // handle : authkey

    constructor() {
      this.users = { };
      this.handles = { };
    }

    generateNewUser() {
      let token;
      do {
        token = Array.apply(null, new Array(10)).map(c => chars[Math.floor(Math.random() * chars.length)]).join('');
      } while (token in this.users)
      let handle;
      do {
        let adj = rndWrds.adje[Math.floor(Math.random() * rndWrds.adje.length)];
        adj = adj[0].toUpperCase() + adj.substring(1, adj.length);
        let verb = rndWrds.verb[Math.floor(Math.random() * rndWrds.verb.length)];
        verb = verb[0].toUpperCase() + verb.substring(1, verb.length);
        let noun = rndWrds.noun[Math.floor(Math.random() * rndWrds.noun.length)];
        noun = noun[0].toUpperCase() + noun.substring(1, noun.length);

        handle = adj + verb + noun;

      } while (this.handleExistsCaseInsensitive(handle))

      let user = new User(token, handle);
      this.users[token] = user;
      this.handles[handle.toLowerCase()] = token;
      return token;
    }

    getUser(authtoken: string) {
      return this.users[authtoken];
    }

    userExists(token) {
      return token in this.users;
    }

    handleExistsCaseInsensitive(handle: string) {
      let keys = Object.keys(this.handles);
      for (let i in keys) {
        if (handle.toLowerCase() == keys[i].toLowerCase()) {
          return true;
        }
      }
      return false;
    }

    changeHandle(token, newHandle): boolean {
      if (this.handleExistsCaseInsensitive(newHandle)) { return false; }
      let user = this.getUser(token);
      this.handles[newHandle.toLowerCase()] = token;
      delete this.handles[user.handle.toLowerCase()];
      user.handle = newHandle;
      return true;
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

  export function viewPublic(req, res) {
    let authtoken = getAuthtoken(req);
    let token = userDatabase.handles[req.params.handle.toLowerCase()];
    if (authtoken != token) {
      res.redirect("/a/" + req.params.handle);
      return;
    }
    renderAccount(authtoken, false, res);
  }

  export function view(req, res) {
    let authtoken = getAuthtoken(req);
    let priv = true;
    if (req.params.handle) {
      let token = userDatabase.handles[req.params.handle.toLowerCase()];
      if (token != authtoken) {
        authtoken = token;
        priv = false;
      }
      if (authtoken) {
        renderAccount(authtoken, priv, res);
        return;
      }
    } else if (authtoken !== undefined) {
      let handle = userDatabase.getUser(authtoken).handle;
      res.redirect("/a/" + handle);
      return;
    }
    res.render("404");
    return;
  }

  function renderAccount(authtoken: string, priv: boolean, res) {
    let handle = userDatabase.getUser(authtoken).handle;
    let property = userDatabase.getUser(authtoken).getProperty();
    let data = {private: priv, handle: handle, property: property};
    if (priv) {
      data["token"] = authtoken;
    }
    res.render('account', data);
  }

  export function getAuthtoken(req) {
    let authtoken;

    if (req.headers.cookie == undefined) { return authtoken; }

    let cookies = req.headers.cookie.split('; ');
    for (let i in cookies) {
      let cookie = cookies[i].split('=');
      if (cookie[0] == 'authtoken' && cookie[1] in userDatabase.users) {
        authtoken = cookie[1];
      }
    }
    return authtoken;
  }

  export function editHandle(req, res) {
    let authtoken = getAuthtoken(req);
    let handle = req.params.handle
    if (!authtoken) {
      res.status(403);
      res.send("Not authorisized.");
    } else if (userDatabase.changeHandle(authtoken, handle)) {
      console.log(userDatabase.handles)
      console.log(userDatabase.getUser(authtoken))
      res.status(200);
      res.send("Success.");
    } else {
      res.status(403);
      res.send("Handle taken.");
    }
  }
}
