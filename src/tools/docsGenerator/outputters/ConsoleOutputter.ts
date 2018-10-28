import { IDocOutputter } from "../interfaces/IDocOutputter";

const SPACES_PER_TAB = 2;

export class ConsoleOutputter implements IDocOutputter {
  private indent = 0;

  decreaseIndent() {
    this.indent--;
    if (this.indent < 0) {
      throw new Error("indent would be negative!");
    }
  }

  increaseIndent() {
    this.indent++;
  }

  outputLine(line: string): void {
    const indentText = " ".repeat(this.indent * SPACES_PER_TAB);

    console.log(`${indentText}${line}`);
  }

  outputLines(lines: string[]): void {
    lines.forEach(line => this.outputLine(line));
  }
}
