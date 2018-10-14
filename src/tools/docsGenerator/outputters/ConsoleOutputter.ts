import { IDocOutputter } from "../interfaces/IDocOutputter";

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
    const indexText = " ".repeat(this.indent);

    console.log(`${indexText}${text}`);
  }
}
