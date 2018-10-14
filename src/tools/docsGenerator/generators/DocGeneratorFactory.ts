import { DocFormat } from "../Config";
import { IDocGenerator } from "../interfaces/IDocGenerator";
import { TextDocGenerator } from "./TextDocGenerator";

export namespace DocGeneratorFactory {
  export function create(format: DocFormat): IDocGenerator {
    switch (format) {
      case DocFormat.Text:
        return new TextDocGenerator();
      default:
        throw new Error(`unhandled format!`);
    }
  }
}
