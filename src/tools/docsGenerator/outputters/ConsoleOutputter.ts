import { OutputterBase } from "./OutputterBase";

export class ConsoleOutputter extends OutputterBase {
  protected writeLine(line: string): void {
    console.log(`${line}`);
  }
}
