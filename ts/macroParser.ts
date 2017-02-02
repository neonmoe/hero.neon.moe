

export module MacroParser {

  const allowedCharacters = "abcdefghijklmnopqrstuvwxyz_";
  const allowedNumbers = "0123456789."

  let functions = {
    "for": function(params: any[], index: number, scopes: Scope[]) {
      let begin = params[0] || 0;
      let end = params[1] || 0;
      return [index < (end - begin), ""];
    },
    "print": function(params, index, scopes: Scope[]) {
      console.log(params.join(""));
      return [false, ""]
    },
    "let": function(params, index, scopes: Scope[]) {
      let varName = params[0];
      let value = params[1];
      if (varName === undefined || value === undefined) { return [false, ""]; }
      createNewVariable(scopes, varName, value);
      return [false, value]
    },
    "set": function(params, index, scopes: Scope[]) {
      let varName = params[0];
      let value = params[1];

      if (varName == undefined || value == undefined) { return [false, ""]; }

      if (!(varName in getAllCurrentVariables(scopes))) {
        return [false, ""];
      }
      editVariable(scopes, varName, value);
      return [false, value]
    },
    "get": function(params, index, scopes: Scope[]) {
      let varName = params[0];
      if (!varName) { return [false, ""]; }
      let vars = getAllCurrentVariables(scopes);
      if (varName in vars) {
        return [false, vars[varName]];
      }
      return [false, ""]
    },
    "plus": function(params, index, scopes: Scope[]) {
      let first = params[0] || 0;
      let second = params[1] || 0;
      return [false, first + second]
    },
    "minus": function(params, index, scopes: Scope[]) {
      let first = params[0] || 0;
      let second = params[1] || 0;
      return [false, first - second]
    }
  };

  export function execute(text: string) {

    let scopeStack = [new Scope(0, 0, () => {}, [])];

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

      if (lastScope(scopeStack).funcStack.length != 0 && lastScope(scopeStack).lastFunc().readyToRun) {
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

      if (c == "}" && !currentString && !justLeftScope) {
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

      if (isAllowedNumber(c)) {
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

      if (c == "(") {
        if (expectingParams(scopeStack)) {
          lastScope(scopeStack).lastFunc().paramsStarted = true;
        } else {
          console.error(`Were not expecting parenthesis (${i})`)
        }
      }

      if (c == ")") {
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

MacroParser.execute(`
  let("counter", 0)
  for(0, 5){
    print("counter: ", get("counter"))
    set("counter", plus(get("counter"), 1))
  }`);

/*

set("joku", 3)

for(0, 5){
  set("joku", get("joku") + 1)
  say(get("joku"))
}

*/
