import { DocConfig } from "../Config";
import { IDocOutputter } from "../interfaces/IDocOutputter";
import { ConsoleOutputter } from "./ConsoleOutputter";
import { FileOutputter } from "./FileOutputter";

export namespace OutputterFactory {
  export function create(config: DocConfig): IDocOutputter {
    if (config.outpath.length > 0) {
      return new FileOutputter(config.outpath);
    }

    return new ConsoleOutputter();
  }
}
