
import {Commander} from "./commander";
import {Universe} from "./universe";
import Namer from "./namer"
import * as FileSystem from "fs";

export module FileReadWrite {

  const backupPath = "backups/"

  function writeFile(path: string, text: string): string {
    path = backupPath + path;
    if (path.lastIndexOf(".json") != path.length - 5) { // Ensure the path ends in .json
      path += ".json";
    }
    let folderpart = path.split("/").slice(0, -1).join("/");
    try {
      if (!FileSystem.existsSync(folderpart)) {
        FileSystem.mkdirSync(folderpart);
      }
      FileSystem.writeFileSync(path, text, {
        flag: "w+"
      });
      return path;
    } catch (e) {
      console.log("Something went wrong, try with a simpler path, or make sure the path exists");
      console.log(e);
      return undefined;
    }
  }

  function readFile(path: string) {
    path = backupPath + path;
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
      console.log("Something went wrong, try with a simpler path, or make sure the path exists");
      console.log(e);
      return undefined;
    }
  }

  export function backupCmd(args: Commander.Arguments) {

    if (args.get("force")) {

      let path = args.getAsString("as");
      let savedTo = writeFile(Namer.convertNameToKey(path), JSON.stringify(Universe.save()));
      if (savedTo) {
        console.log("Universe saved to " + savedTo);
      }

    } else {
      console.log("Backup currently only possible in force mode.")
    }
  }

  export function backupLoadCmd(args: Commander.Arguments) {
    let text = readFile(args.getAsString());
    if (text) {
      let data = {};
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.log("Backup is corrupted and could not be parsed.")
      }
      if (Object.keys(data).length != 0) {
        Universe.load(data);
        console.log("Universe loaded successfully");
      }
    }
  }
}
