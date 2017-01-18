import Character from "./character";

export module Universe {
  let worlds: {[key: string]: {[key: string]: Character}} = {};
  let worldPopulationLimit = 64;

  /** Just a convenience function, an "encoder" for the world and character names. */
  function convertNameToKey(name: string) {
    return name.toLowerCase().replace(" ", "-");
  }

  function getWorld(world: string) {
    return worlds[convertNameToKey(world)];
  }

  export function createWorld(world: string) {
    if (!worldExists(world)) {
      worlds[convertNameToKey(world)] = {};
      console.log("Created a world named '" + world + "'.");
    }
  }

  export function worldExists(world: string) {
    return Object.keys(worlds).indexOf(convertNameToKey(world)) != -1;
  }

  /** Returns true when the world is full (see Universe.worldPopulationLimit) or doesn't exist (you can't put stuff in non existing things). */
  export function isWorldFull(world: string) {
    if (worldExists(world)) {
      return Object.keys(getWorld(world)).length >= worldPopulationLimit;
    } else {
      return true;
    }
  }

  /** Returns false when the character can't be created, ie. when it exists already or the world is full. (See Universe.isWorldFull() for more specifics.) */
  export function createCharacter(world: string, name: string): boolean {
    if (characterExists(world, name)) {
      return false;
    } else if (isWorldFull(world)) {
      console.log("Didn't create character '" + name + "' because the world '" + world + "' is full!");
      return false;
    } else {
      let key = convertNameToKey(name);
      getWorld(world)[key] = new Character(name);
      console.log("Created a character named '" + name + "' on the world '" + world + "'.");
      return true;
    }
  }

  export function characterExists(world: string, name: string) {
    return worldExists(world) && Object.keys(getWorld(world)).indexOf(convertNameToKey(name)) != -1;
  }

  export function getCharacter(world: string, name: string) {
    if (characterExists(world, name)) {
      return getWorld(world)[convertNameToKey(name)];
    }
  }
}
