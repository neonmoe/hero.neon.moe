import * as readline from "readline";

export module Commander {
  let values: {[key: string]: Function} = {};
  let reader: readline.ReadLine;

  export function registerCommand(command: string, func: Function) {
    values[command] = func;
  }

  export function callCommand(callingText: string) {
    let commandEndIndex = callingText.indexOf(" ");
    if (commandEndIndex == -1) {
      commandEndIndex = callingText.length;
    }
    let command = callingText.substring(0, commandEndIndex);
    let argumentsText = callingText.substring(commandEndIndex + 1);
    if (values[command]) {
      values[command](new Arguments(argumentsText));
    }
  }

  export function startListening() {
    reader = readline.createInterface({
      input: process.stdin, output: process.stdout
    });
    reader.on("line", (line: string) => {
      callCommand(line.trim());
    });
  }

  export function stopListening() {
    reader.close();
  }

  export class Arguments {
    private args: {[key: string]: string[]} = {"default": []};

    constructor(argumentsAsText: string) {
      let argumentParts = argumentsAsText.split(" ");
      let currentArgument = "default";
      for (let i = 0; i < argumentParts.length; i++) {
        if (argumentParts[i].indexOf("--") == 0) {
          currentArgument = argumentParts[i].substring(2);
          this.args[currentArgument] = [];
        } else {
          this.args[currentArgument].push(argumentParts[i]);
        }
      }
    }

    get(argument: string = "default"): string[] {
      if (this.args[argument]) {
        return this.args[argument];
      } else {
        return undefined;
      }
    }

    getAsString(argument: string = "default"): string {
      if (this.args[argument]) {
        return this.args[argument].join(" ");
      } else {
        return "";
      }
    }
  }
}
