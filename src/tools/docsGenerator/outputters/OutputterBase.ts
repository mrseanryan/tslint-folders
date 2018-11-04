import { IDocOutputter } from "../interfaces/IDocOutputter";

const SPACES_PER_TAB = 2;

export abstract class OutputterBase implements IDocOutputter {
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
    const indentText = " ".repeat(this.indent * SPACES_PER_TAB);

    this.writeLine(`${indentText}${text}`);
  }

  outputLines(lines: string[]): void {
    lines.forEach(line => this.outputLine(line));
  }

  protected abstract writeLine(line: string): void;
}
