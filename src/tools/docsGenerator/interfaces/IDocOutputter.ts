export interface IDocOutputter {
  decreaseIndent(): any;
  increaseIndent(): any;
  outputLine(text: string): void;
  outputLines(text: string[]): void;
}
