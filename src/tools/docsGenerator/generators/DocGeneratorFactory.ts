import { DocFormat } from "../Config";
import { IDocGenerator } from "../interfaces/IDocGenerator";
import { DotDocGenerator } from "./dot/DotDocGenerator";
import { TextDocGenerator } from "./text/TextDocGenerator";

export namespace DocGeneratorFactory {
  export function create(format: DocFormat): IDocGenerator {
    switch (format) {
      case DocFormat.Dot:
        return new DotDocGenerator();
      case DocFormat.Text:
        return new TextDocGenerator();
      default:
        throw new Error(`unhandled format '${format}'`);
    }
  }
}
