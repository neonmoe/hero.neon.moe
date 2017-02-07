
export namespace Omega {
  export interface Output {
    stack: (ChatOutput|Exception|Log)[]
  }

  export interface RollResult {
    result: number;
    middleStep: string;
    initial: string;
  }

  export class ChatOutput {
    channel: string;
    message: (string|RollResult)[];
    data: {[key: string]: string}

    constructor(message: (string|RollResult)[], channel: string, data: {[key: string]: string} = {}) {
      this.channel = channel;
      this.message = message;
      this.data = data;
    }
  }

  export class Log {
    message: string;

    constructor(message: string) {
      this.message = message;
    }
  }

  export class Exception {
    message: string;
    location: number[]

    constructor(message: string, location: number[]) {
      this.message = message;
      this.location = location;
    }
  }
}
