
import * as express from "express";
import {Omega} from "./omegaOutput"
import {OmegaParser} from "./omegaParser"

export module OmegaRequestHandler {

  const requestCooldown = 250;

  let lastRequest = 0;

  export function executeOnRequest(req: express.Request, res: express.Response) {
    let curr = Date.now();
    if (curr <= (lastRequest + requestCooldown)) {
      let output: Omega.Output = {
        stack: []
      };
      output.stack.push(new Omega.Log("Requests incoming too fast."));
      res.send(output);
    } else {
      let output = OmegaParser.executeSafe(req.get("Macro-Text").replace(/\\n/g, "\n"));
      res.send(output);
    }
    lastRequest = curr;
  }
}
