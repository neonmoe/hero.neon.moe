import Character from "./character";
import Namer from "./namer";

export module Universe {
  let worlds: {[key: string]: {[key: string]: Character}} = {};
  let worldPopulationLimit = 64;

  function getWorld(world: string) {
    return worlds[Namer.convertNameToKey(world)];
  }

  export function createWorld(world: string) {
    if (!worldExists(world)) {
      worlds[Namer.convertNameToKey(world)] = {};
      console.log("Created a world named '" + world + "'.");
    }
  }

  export function worldExists(world: string) {
    return Object.keys(worlds).indexOf(Namer.convertNameToKey(world)) != -1;
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
      let key = Namer.convertNameToKey(name);
      getWorld(world)[key] = new Character(name);
      console.log("Created a character named '" + name + "' on the world '" + world + "'.");
      return true;
    }
  }

  export function characterExists(world: string, name: string) {
    return worldExists(world) && Object.keys(getWorld(world)).indexOf(Namer.convertNameToKey(name)) != -1;
  }

  export function getCharacter(world: string, name: string) {
    if (characterExists(world, name)) {
      return getWorld(world)[Namer.convertNameToKey(name)];
    }
  }
}
