
export default class Namer {
  static chars = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'a', 'b', 'c', 'd', 'e', 'f'];
  static rndWrds = {
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

  /** Just a convenience function, an "encoder" for the world and character names. Changes everything except A-Z, a-z, 0-9 and _ into -. */
  static convertNameToKey(name: string) {
    return name.toLowerCase().replace(/[^A-Za-z0-9_/]/g, "-");
  }

  /** For prettifying keys. */
  static convertKeyToName(key: string) {
    return key.split("-").map(c => c.substring(0, 1).toUpperCase() + c.substring(1)).join(" ");
  }

  /** Generate a string of hex characters at specified length */
  static generateHexString(length: number) {
    return Array.apply(null, new Array(length)).map(c => Namer.chars[Math.floor(Math.random() * Namer.chars.length)]).join('');
  }

  static generateRandomName() {
    let adj = Namer.rndWrds.adje[Math.floor(Math.random() * Namer.rndWrds.adje.length)];
    adj = adj[0].toUpperCase() + adj.substring(1, adj.length);
    let verb = Namer.rndWrds.verb[Math.floor(Math.random() * Namer.rndWrds.verb.length)];
    verb = verb[0].toUpperCase() + verb.substring(1, verb.length);
    let noun = Namer.rndWrds.noun[Math.floor(Math.random() * Namer.rndWrds.noun.length)];
    noun = noun[0].toUpperCase() + noun.substring(1, noun.length);

    return adj + verb + noun;
  }
}
