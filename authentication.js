
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
            chars[Math.floor(Math.random() * chars.length)]).join(''));
      } while (token in this.users)

      let user = new User(token);
      this.users[token] = user;
      return token;
   }

   userExists(token) {
      return token in this.users;
   }
}
