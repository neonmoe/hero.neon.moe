
import {Commander} from "./commander";
import {Universe} from "./universe";
import Namer from "./namer"
import * as FileSystem from "fs";

export module FileReadWrite {

  const savePath = "saves/"
  const autosaves = savePath + "autosaves/"

  function writeFile(path: string, text: string): string {
    if (path.lastIndexOf(".json") != path.length - 5) { // Ensure the path ends in .json
      path += ".json";
    }
    let folderpart = path.split("/").slice(0, -1).join("/");
    try {
      ensurePath(folderpart);
      FileSystem.writeFileSync(path, text, {
        flag: "w+"
      });
      return path;
    } catch (e) {
      console.log("Something went wrong, try with a simpler path, or make sure the path exists.");
      console.error(e);
      return undefined;
    }
  }

  function readFile(path: string) {
    if (path.lastIndexOf(".json") != path.length - 5) { // Ensure the path ends in .json
      path += ".json";
    }
    try {
      if (FileSystem.existsSync(path)) {
        let text = FileSystem.readFileSync(path, {
          encoding: "utf-8"
        });
        return text;
      } else {
        console.log(`${path} not found.`)
      }
    } catch (e) {
      console.log("Something went wrong, try with a simpler path, or make sure the path exists.");
      console.error(e);
      return undefined;
    }
  }

  function ensurePath(path: string) {
    let pathParts = path.split("/");
    let currPath = "";
    pathParts.forEach(dir => {
      currPath += dir + "/";
      if (FileSystem.existsSync(currPath)) {
        if (FileSystem.lstatSync(currPath).isDirectory()) {
          return; // This part already exists, and is a directory, yay!
        } else {
          throw `Error: ${currPath} refers to a file.`
        }
      } else {
        FileSystem.mkdirSync(currPath);
      }
    });
  }

  function loadUniverse(path: string) {
    let text = readFile(path);
    if (text) {
      let data = {};
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.log("Backup is corrupted and could not be parsed.")
      }
      if (Object.keys(data).length != 0) {
        Universe.load(data);
        console.log(`Universe from ${path} loaded successfully.`);
      }
    } else {
      console.error(`Could not load ${path}`);
    }
  }

  function saveUniverseTo(path: string) {
    return writeFile(Namer.convertNameToKey(path),
      JSON.stringify(Universe.save()));
  }

  function getAutosaves(): string[] {
    let saves = FileSystem.readdirSync(autosaves);
    saves = saves.filter(f => f.indexOf("auto-") == 0);
    return saves;
  }

  function birthdateSorter(filename: string, other: string): number {
    return FileSystem.lstatSync(autosaves + filename).birthtime.getTime() -
      FileSystem.lstatSync(autosaves + other).birthtime.getTime();
  }

  export function loadNewestAutosave() {

    if (FileSystem.existsSync(autosaves)) {
      let saves = getAutosaves().sort(birthdateSorter);
      if (saves.length > 0) {
        loadUniverse(autosaves + saves[saves.length - 1]);
      } else {
        console.log("No autosaves to load")
      }
    } else {
      console.log("Autosaves folder does not exist yet.")
    }
  }

  export function createNewAutosave() {
    // Make sure the save path exists
    ensurePath(autosaves);

    // Get all current autosaves
    let saves = getAutosaves().sort(birthdateSorter);

    // Delete redundant saves, only leave the 9 newest saves
    let oldestSaves = saves.slice(0, -9);
    oldestSaves.forEach(savePath => {
      FileSystem.unlinkSync(autosaves + savePath);
    });

    // Create new save
    // Create the name for the save (Format: 'auto-042321-01022017')
    let saveName = autosaves + "auto-";
    let date = new Date();
    saveName += ('0' + date.getSeconds()).slice(-2);
    saveName += ('0' + date.getMinutes()).slice(-2);
    saveName += ('0' + date.getHours()).slice(-2) + "-";
    saveName += ('0' + date.getDate()).slice(-2);
    saveName += ('0' + date.getMonth()).slice(-2);
    saveName += ('0' + date.getFullYear()).slice(-2);

    let savedTo = saveUniverseTo(saveName);
    if (savedTo) {
      console.log(`Automatically saved universe to ""${savedTo}"`);
    } else {
      console.error("Automatic save of the universe failed.")
    }
  }

  export function saveCmd(args: Commander.Arguments) {

    if (args.get("autosave")) {
      createNewAutosave();
    } else {

      if (args.get("force")) {

        let path = savePath + args.getAsString();
        let savedTo = saveUniverseTo(path);
        if (savedTo) {
          console.log(`Universe saved to ${savedTo}"`);
        }

      } else {
        console.log("Backup currently only possible in force mode.")
      }
    }
  }

  export function loadCmd(args: Commander.Arguments) {
    if (args.get("autosave")) {
      loadNewestAutosave();
    } else {
      let path = savePath + args.getAsString();
      loadUniverse(path);
    }
  }
}
