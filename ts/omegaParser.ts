
export module OmegaParser {

  const rollRegex = /^([1-9]+[0-9]*)d([1-9]+[0-9]*)$/g;

  const allowedCharacters = "abcdefghijklmnopqrstuvwxyz_";
  const allowedNumbers = "0123456789.-"
  const operators = "+-*^/";
  const importantOperators = "*/^";

  function loopContent(paren: Parenthesis, rootParen: Parenthesis): Parenthesis {
    paren.parent = null;
    paren.content.forEach((cont, i) => {
      if (typeof cont != "string") {
        paren.content[i] = loopContent(cont, rootParen);
      }
    });
    return paren;
  }

  let functions = {
    "for": function(params: any[], index: number) {
      let begin = params[0] || 0;
      let end = params[1] || 0;
      return [index < (end - begin), ""];
    },
    "print": function(params: any[]) {
      let strings: string[] = [];
      params.forEach(param => {
        strings.push(param.toString());
      });
      console.log(strings.join(" "));
      return [false, ""]
    },
    "let": function(params: any[], index: number, scopes: Scope[]) {
      let varName = params[0];
      let value = params[1];
      if (varName === undefined || value === undefined) { return [false, ""]; }
      createNewVariable(scopes, varName, value);
      return [false, value]
    },
    "set": function(params: any[], index: number, scopes: Scope[]) {
      let varName = params[0];
      let value = params[1];

      if (varName == undefined || value == undefined) { return [false, ""]; }

      if (!(varName in getAllCurrentVariables(scopes))) {
        return [false, ""];
      }
      editVariable(scopes, varName, value);
      return [false, value]
    },
    "get": function(params: any[], index: number, scopes: Scope[]) {
      let varName = params[0];
      if (!varName) { return [false, ""]; }
      let vars = getAllCurrentVariables(scopes);
      if (varName in vars) {
        return [false, vars[varName]];
      }
      return [false, ""]
    },
    "plus": function(params: any[]) {
      let first = params[0] || 0;
      let second = params[1] || 0;
      return [false, first + second];
    },
    "minus": function(params: any[]) {
      let first = params[0] || 0;
      let second = params[1] || 0;
      return [false, first - second];
    },
    "roll": function(params: any[], index: number, scopes: Scope[]) {
      let rollParam = params[0] || "";
      let formatted = replaceFormatsWithVariables(rollParam, getAllCurrentVariables(scopes));

      let paren = breakIntoParenthesis(formatted);
      paren = parenthesizeParenthesis(paren);

      if (!paren) {
        console.log("Macro parsing failed. Parenthesis(es) left open!");
        return [false, null];
      }

      let functions = {
        "floor": Math.floor
      }


      let tempContent: string[] = [];
      paren.content.forEach(item => {
        rollRegex.lastIndex = 0;
        if (typeof item == "string") {
          if (rollRegex.exec(item) == null) {
            tempContent.push(item);
          } else {
            tempContent.push(calculcateParenthesis({parent: paren, func: "", content: [item]}, functions) + "");
          }
        } else {
          tempContent.push(calculcateParenthesis(item, functions) + "");
        }
      });
      paren.content = tempContent;

      return [false, JSON.stringify([calculcateParenthesis(paren, functions), tempContent.join(" "), rollParam], null, 2)];
    }
  };

  export function executeSafe(text: string,
    globalFunctions: {[name: string]: (params: string[]) => any} = {},
    globalVariables: {[name: string]: any} = {}) {

    try {
      return execute(text, globalFunctions, globalVariables);
    } catch (e) {
      console.error("Fatal error occoured executing code.");
      console.error(e);
      return null;
    }
  }

  export function execute(text: string,
    globalFunctions: {[name: string]: (params: string[]) => any} = {},
    globalVariables: {[name: string]: any} = {}) {

    // Initialize global Scope
    let scopeStack = [new Scope(0, 0, () => {}, [])];

    // Initialize global functions and variables
    Object.keys(globalFunctions).forEach(func => {
      functions[func] = globalFunctions[func];
    });
    Object.keys(globalVariables).forEach(v => {
      scopeStack[0].variables[v] = globalVariables[v];
    });

    let currentString: string = undefined;
    let currentNumber: string = undefined;

    for (let i = 0; i < text.length; i++) {
      let c = text[i];

      let justLeftScope = false;

      if (lastScope(scopeStack).ignoreUntilScopeEnds > 0) {
        if (c == "{") {
          lastScope(scopeStack).ignoreUntilScopeEnds += 1;
        } else if (c == "}") {
          lastScope(scopeStack).ignoreUntilScopeEnds -= 1;
        }
        if (lastScope(scopeStack).ignoreUntilScopeEnds > 0) {
          continue;
        } else {
          justLeftScope = true;
        }
      }

      if (currentString === undefined && lastScope(scopeStack).funcStack.length != 0 && lastScope(scopeStack).lastFunc().readyToRun) {
        if (c != "{") {
          if (isAllowedLetter(c) || isAllowedNumber(c)) {
            console.error(`Unexpected character after function call (${i})`)
            return false;
          }
          let returned = lastScope(scopeStack).runLastFunc(0, scopeStack);
          if (lastScope(scopeStack).funcStack.length != 0 && lastScope(scopeStack).lastFunc().paramsStarted && !lastScope(scopeStack).lastFunc().expectingComma) {
            lastScope(scopeStack).lastFunc().addParam(returned[1]);
          }
        } else {
          let returned = lastScope(scopeStack).runLastFunc(0, scopeStack);
          if (returned[0]) {
            scopeStack.push(new Scope(i + 1, 0, returned[2], returned[3]));
          } else {
            lastScope(scopeStack).ignoreUntilScopeEnds = 1;
          }
        }
      }

      if (currentString === undefined && c == "}" && !currentString && !justLeftScope) {
        if (lastScope(scopeStack).funcStack.length != 0) {
          console.error(`Cannot exit out of scope in middle of a function call. (${i})`);
          return false;
        } else if (scopeStack.length == 1) {
          console.error(`Cannot exit topmost scope. (${i})`);
          return false;
        }

        let oldScope = scopeStack.pop();
        let returned = oldScope.scopeFunc(oldScope.scopeFuncParams, oldScope.scopeCounter + 1);
        if (returned[0]) {
          i = oldScope.start;
          scopeStack.push(new Scope(i, oldScope.scopeCounter + 1, oldScope.scopeFunc, oldScope.scopeFuncParams));
        } else {
          continue;
        }
      }

      if (currentString === undefined && isAllowedNumber(c)) {
        if (currentNumber) {
          currentNumber += c;
          continue;
        } else {
          if (expectingParams(scopeStack) || (lastScope(scopeStack).funcStack.length != 0 && lastScope(scopeStack).lastFunc().paramsStarted && lastScope(scopeStack).lastFunc().expectingComma)) {
            console.error(`Expecing parenthesis or a comma to separate parameters (${i})`);
            return false;
          }
          currentNumber = c;
        }
      } else if (currentNumber && (c == " " || c == "\n" || c == ")" || c == ",")) {
        if (lastScope(scopeStack).funcStack.length == 0 || (lastScope(scopeStack).lastFunc().paramsStarted && !lastScope(scopeStack).lastFunc().expectingComma)) {
          lastScope(scopeStack).lastFunc().addParam(parseFloat(currentNumber));
        }
        currentNumber = undefined;
      }

      if (c == " " || c == "\n") {
        if (currentString) {
          currentString += c;
          continue;
        }
        if (expectingParams(scopeStack)) {
          console.error(`Expecing parenthesis. (${i})`);
          return false;
        }

        continue; // Ignore spaces and newlines
      }

      if (c == '"') {
        if (currentString) {
          // Spew out string for parameters, if parametets started
          if (lastScope(scopeStack).funcStack.length != 0 && (lastScope(scopeStack).lastFunc().paramsStarted && !lastScope(scopeStack).lastFunc().expectingComma)) {
            lastScope(scopeStack).lastFunc().addParam(currentString)
          }
          currentString = undefined;
        } else {
          if (expectingParams(scopeStack) || (lastScope(scopeStack).funcStack.length != 0 && lastScope(scopeStack).lastFunc().paramsStarted && lastScope(scopeStack).lastFunc().expectingComma)) {
            console.error(`Expecing parenthesis or a comma to separate parameters (${i})`);
            return false;
          }
          // If parameters started, check for commas, otherwise ¯\_(ツ)_/¯
          currentString = "";
        }
      }

      if (currentString !== undefined && c != '"') {
        currentString += c;
        continue;
      }

      if (isAllowedLetter(c)) {
        if (lastScope(scopeStack).funcStack.length == 0 || (lastScope(scopeStack).lastFunc().paramsStarted && !lastScope(scopeStack).lastFunc().expectingComma)) {
          lastScope(scopeStack).funcStack.push(new FuncRunner());
          lastScope(scopeStack).lastFunc().currFunctionName += c;
        } else {
          lastScope(scopeStack).lastFunc().currFunctionName += c;
        }
      }

      if (c == ",") {
        if (lastScope(scopeStack).funcStack.length != 0 && lastScope(scopeStack).lastFunc().paramsStarted && lastScope(scopeStack).lastFunc().expectingComma) {
          lastScope(scopeStack).lastFunc().applyComma();
          continue;
        } else {
          console.error(`Unexpected comma (${i})`);
          return false;
        }
      }

      if (currentString === undefined && c == "(") {
        if (expectingParams(scopeStack)) {
          lastScope(scopeStack).lastFunc().paramsStarted = true;
        } else {
          console.error(`Were not expecting parenthesis (${i})`)
        }
      }

      if (currentString === undefined && c == ")") {
        if (lastScope(scopeStack).funcStack.length == 0 || (lastScope(scopeStack).lastFunc().paramsStarted && (!lastScope(scopeStack).lastFunc().expectingComma && lastScope(scopeStack).lastFunc().currParams.length > 0))) {
          console.error(`Function not started, opening parenthesis not started or not expecting a closing parenthesis (${i})`);
          return false;
        }
        lastScope(scopeStack).lastFunc().readyToRun = true;
        if (i == text.length - 1) {
          lastScope(scopeStack).runLastFunc(0, scopeStack);
        }
      }
    }
  }

  function isAllowedLetter(l: string): boolean {
    let chars = allowedCharacters.split("");
    return chars.indexOf(l) >= 0;
  }

  function isAllowedNumber(l: string): boolean {
    let chars = allowedNumbers.split("");
    return chars.indexOf(l) >= 0;
  }

  function isOperator(l: string): boolean {
    let chars = operators.split("");
    return chars.indexOf(l) >= 0;
  }

  function isImportantOperator(l: string): boolean {
    let chars = importantOperators.split("");
    return chars.indexOf(l) >= 0;
  }

  function expectingParams(stack: Scope[]): boolean {
    if (lastScope(stack).funcStack.length == 0) {
      return false;
    }
    return lastScope(stack).lastFunc().currFunctionName != "" &&
      !lastScope(stack).lastFunc().paramsStarted;
  }

  function lastScope(stack: Scope[]) {
    return stack[stack.length - 1];
  }

  function getAllCurrentVariables(stack: Scope[]) {
    let vars = {};
    stack.forEach(scope => {
      Object.keys(scope.variables).forEach(varName => {
        vars[varName] = scope.variables[varName];
      })
    });
    return vars;
  }

  function editVariable(stack: Scope[], name: string, newValue: any) {
    stack.slice(0).reverse().forEach(scope => {
      if (name in scope.variables) {
        scope.variables[name] = newValue;
        return;
      }
    })
  }

  function createNewVariable(stack: Scope[], name: string, initialValue: any) {
    if (name in lastScope(stack).variables) {
      console.error(`Variable ${name} already exists.`);
      return;
    }
    lastScope(stack).variables[name] = initialValue;
  }

  function replaceFormatsWithVariables(text: string, variables: {[key: string]: any}): string {
    Object.keys(variables).forEach(v => {
      do {
        text = text.replace("{" + v + "}", "(" + variables[v] + ")");
      } while (text.indexOf("{" + v + "}") >= 0)
    });
    return text;
  }

  function calculcateParenthesis(paren: Parenthesis, functions: {[key: string]: (input: number) => number}): number {

    let currTotal = 0;
    let trueContent: string[] = [];
    paren.content.forEach(item => {
      if (typeof item != "string") {
        trueContent.push(calculcateParenthesis(item, functions) + "");
      } else {
        trueContent.push(item);
      }
    });
    let currOperator: string = "+";
    for (let i = 0; i < trueContent.length; i++) {
      let currTerm = trueContent[i];
      if (isOperator(currTerm)) {
        currOperator = currTerm;
      } else {
        rollRegex.lastIndex = 0;
        let result = rollRegex.exec(currTerm);
        let value = 0;
        if (result) {
          value = 0;
          for (let x = 0; x < parseInt(result[1]); x++) {
            value += Math.floor(Math.random() * parseInt(result[2])) + 1;
          }
        } else {
          value = parseFloat(currTerm);
        }
        switch (currOperator) {
          case "+": {
            currTotal += value;
            break;
          }
          case "-": {
            currTotal -= value;
            break;
          }
          case "*": {
            currTotal *= value;
            break;
          }
          case "/": {
            currTotal /= value;
            break;
          }
          case "^": {
            currTotal = Math.pow(currTotal, value);
            break;
          }
        }

      }
    }

    if (paren.func.trim() in functions) {
      currTotal = functions[paren.func.trim()](currTotal);
    }

    return currTotal;
  }

  function breakIntoParenthesis(text: string) {
    let rootParen: Parenthesis = {
      parent: null,
      func: "",
      content: []
    };
    let currParen = rootParen;
    let currString = "";

    let currFunc = "";
    for (let i = 0; i < text.length; i++) {
      let c = text[i];

      if (c == "(") {
        if (currString.trim().length > 0) {
          if (currString[currString.length - 1] != " " && !isOperator(currString)) {
            currFunc = currString;
          } else {
            currParen.content.push(currString.trim());
          }
        }
        currString = "";
        let newParen: Parenthesis = {
          parent: currParen,
          func: currFunc,
          content: []
        }
        currParen.content.push(newParen);
        currParen = newParen;
        continue;
      } else if (c == ")") {
        if (currString.trim().length > 0) {
          currParen.content.push(currString.trim());
        }
        currString = "";
        currParen = currParen.parent;
        continue;
      } else if (!isAllowedLetter(c)) {
        currFunc = "";
      }
      if (isOperator(c)) {
        if (currString.trim().length > 0) {
          currParen.content.push(currString.trim());
        }
        currString = "";
        currParen.content.push(c);
        continue;
      }

      currString += c;
      if (i == text.length - 1) {
        // If this is the last character, add the string as new content
        currParen.content.push(currString.trim());
      }

    }

    if (currParen != rootParen) {
      return null;
    }
    return rootParen;
  }

  function parenthesizeParenthesis(paren: Parenthesis): Parenthesis {

    paren.content.forEach(c => {
      if (typeof c != "string") {
        c = parenthesizeParenthesis(c);
      }
    });

    let firstImportantIndex = -1;
    let ops = importantOperators.split("");
    do {
      firstImportantIndex = -1;

      for (let i = 0; i < ops.length; i++) {
        let idx = paren.content.indexOf(ops[i]);
        if (idx != -1) {
          if (firstImportantIndex == -1) {
            firstImportantIndex = idx;
          } else {
            firstImportantIndex = Math.min(firstImportantIndex, idx);
          }
        }
      }

      if (firstImportantIndex != -1) {
        let temp = paren.content;
        paren.content = paren.content.slice(0, Math.max(0, firstImportantIndex - 2))
        paren.content.push({
          parent: paren,
          func: "",
          content: [temp[firstImportantIndex - 1],
            temp[firstImportantIndex],
            temp[firstImportantIndex + 1]]
        });
        let rest = temp.slice(firstImportantIndex + 2);
        paren.content = paren.content.concat(rest);
      }

    } while (firstImportantIndex != -1)


    for (let i = 0; i < paren.content.length; i++) {
      let currTerm = paren.content[i];
    }

    return paren;
  }

  // An interface used only in the small macro-language used by the roll-function
  interface Parenthesis {
    func: string;
    content: (Parenthesis | string)[];
    parent: Parenthesis;
  }


  class Scope {
    funcStack: FuncRunner[] = [];
    ignoreUntilScopeEnds: number = 0;

    scopeCounter: number = 0; // How many'th time interpreter is in the scope
    start: number = 0; // What character the scope started at

    scopeFunc: Function = null; // Function which caused the scope
    scopeFuncParams: any[] = []; // Params given to the function ^

    variables: {[name: string]: any} = {};

    constructor(start: number, counter: number, func: Function, params: any[]) {
      this.start = start;
      this.scopeCounter = counter;
      this.scopeFunc = func;
      this.scopeFuncParams = params;
    }

    lastFunc() {
      return this.funcStack[this.funcStack.length - 1];
    }

    runLastFunc(scopeCount: number, scopes: Scope[]) {
      return this.funcStack.pop().runFunction(scopeCount, scopes);
    }
  }

  class FuncRunner {
    currFunctionName = "";
    currParams = [];
    paramsStarted = false;
    expectingComma = false;
    expectingParam = true;
    readyToRun = false;

    addParam(param: string | number) {
      this.currParams.push(param);
      this.expectingComma = true;
      this.expectingParam = false;
    }

    applyComma() {
      this.expectingComma = false;
      this.expectingParam = true;
    }

    runFunction(count: number, scopes: Scope[]) {
      if (!(this.currFunctionName in functions)) {
        console.error(`Function not found: ${this.currFunctionName}`);
        return [false, ""];
      }
      let returns = functions[this.currFunctionName](this.currParams, count, scopes);
      returns.push(functions[this.currFunctionName]);
      returns.push(this.currParams);
      return returns;
    }
  }

}

OmegaParser.executeSafe(`
  print(roll("{strength} * 5 + floor(7 / 2)"))
  `, {}, {
    "strength": 3
  });
/*

set("joku", 3)

for(0, 5){
  set("joku", get("joku") + 1)
  say(get("joku"))
}

*/
