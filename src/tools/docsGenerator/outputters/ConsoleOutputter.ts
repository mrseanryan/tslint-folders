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

  outputLine(text: string): void {
    const indexText = " ".repeat(this.indent * SPACES_PER_TAB);

    console.log(`${indexText}${text}`);
  }
}
