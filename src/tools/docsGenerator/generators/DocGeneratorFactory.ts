import { DocConfig, DocFormat } from "../Config";
import { IDocGenerator } from "../interfaces/IDocGenerator";
import { IDocOutputter } from "../interfaces/IDocOutputter";
import { DotDocGenerator } from "./dot/DotDocGenerator";
import { TextDocGenerator } from "./text/TextDocGenerator";

export namespace DocGeneratorFactory {
  export function create(
    config: DocConfig,
    outputter: IDocOutputter
  ): IDocGenerator {
    switch (config.format) {
      case DocFormat.Dot:
        return new DotDocGenerator(config, outputter);
      case DocFormat.Text:
        return new TextDocGenerator(config, outputter);
      default:
        throw new Error(`unhandled format '${config.format}'`);
    }
  }
}
