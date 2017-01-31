import * as express from "express";
import Namer from "./namer";
import {Universe} from "./universe";

/**
* API for authenticating, checking authentication and checking permissions.
*/
export module Authentication {

  class User {

    token: string;
    handle: string;

    constructor(token: string, handle: string) {
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

    generateNewUser(): string {
      let token: string;
      do {
        token = Namer.generateHexString(10);
      } while (token in this.users)
      let handle;
      do {
        handle = Namer.generateRandomName();

      } while (this.handleExistsCaseInsensitive(handle))

      let user = new User(token, handle);
      this.users[token] = user;
      this.handles[handle.toLowerCase()] = token;
      return token;
    }

    getUser(authtoken: string): User {
      return this.users[authtoken];
    }

    userExists(token: string): boolean {
      return token in this.users;
    }

    handleExistsCaseInsensitive(handle: string): boolean {
      let keys = Object.keys(this.handles);
      for (let i in keys) {
        if (handle.toLowerCase() == keys[i].toLowerCase()) {
          return true;
        }
      }
      return false;
    }

    changeHandle(token: string, newHandle: string): boolean {
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

    counter: number;
    permissions: {[id: number]: string[]};
    identifiers: {[id: number]: string};

    permittedTokens: string[];

    constructor() {
      this.counter = 0;
      this.permissions = {};
      this.identifiers = {};
    }

    new(identifier: string): number {
      let id = this.counter++;
      this.permissions[id] = [];
      this.identifiers[id] = Namer.convertNameToKey(identifier);
      return id;
    }

    has(id: number, token: string): boolean {
      return this.permissions[id].indexOf(token) >= 0;
    }

    reqHas(id: number, req: express.Request): boolean {
      return this.has(id, getAuthtoken(req));
    }

    give(id: number, token: string) {
      let user = userDatabase.getUser(token);
      let name = (user !== undefined) ? user.handle : token;
      console.log(`Permission for ${this.identifiers[id]} given to ${name}`);
      if (!this.has(id, token)) {
        this.permissions[id].push(token);
      }
    }

    revoke(id: number, token: string) {
      let user = userDatabase.getUser(token);
      let name = (user !== undefined) ? user.handle : token;
      console.log(`Permission for ${this.identifiers[id]} revoked from ${name}`);
      if (this.has(id, token)) {
        this.permissions[id].splice(this.permissions[id].indexOf(token), 1);
      }
    }
  }

  export const permission = new PermissionList();

  export function generateUser(req: express.Request, res: express.Response) {
    let token = userDatabase.generateNewUser();
    permission.give(Universe.getCharacter("Heaven", "Jesus").viewPL, token);
    permission.give(Universe.getCharacter("Heaven", "Jesus").editPL, token);
    res.cookie('authtoken', token, {expires: new Date(Date.now() + 31536000000)});
    res.send(token);
  }

  export function viewPublic(req: express.Request, res: express.Response) {
    let authtoken = getAuthtoken(req);
    let token = userDatabase.handles[req.params.handle.toLowerCase()];
    if (authtoken != token) {
      res.redirect("/a/" + req.params.handle);
      return;
    }
    renderAccount(authtoken, false, res);
  }

  export function view(req: express.Request, res: express.Response) {
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

  function renderAccount(authtoken: string, priv: boolean, res: express.Response) {
    let handle = userDatabase.getUser(authtoken).handle;
    let property = userDatabase.getUser(authtoken).getProperty();
    let data = {private: priv, handle: handle, property: property};
    if (priv) {
      data["token"] = authtoken;
    }
    res.render('account', data);
  }

  export function getAuthtoken(req: express.Request) {
    let authtoken;

    if (req.headers["cookie"] == undefined) { return authtoken; }

    let cookies = req.headers["cookie"].split('; ');
    for (let i in cookies) {
      let cookie = cookies[i].split('=');
      if (cookie[0] == 'authtoken' && cookie[1] in userDatabase.users) {
        authtoken = cookie[1];
      }
    }
    return authtoken;
  }

  export function editHandle(req: express.Request, res: express.Response) {
    let authtoken = getAuthtoken(req);
    let oldHandle = userDatabase.getUser(authtoken).handle;
    let handle = req.params.handle
    if (!authtoken) {
      res.status(403);
      res.send("Not authorisized.");
    } else if (userDatabase.changeHandle(authtoken, handle)) {
      console.log(`${oldHandle} is now known as ${handle}`);
      res.status(200);
      res.send("Success.");
    } else {
      res.status(403);
      res.send("Handle taken.");
    }
  }
}
