import { PackageConfig } from "../../../model/PackageConfig";
import { DocConfig } from "../Config";
import { IDocOutputter } from "./IDocOutputter";

export interface IDocGenerator {
  generateDoc(
    config: DocConfig,
    packageConfig: PackageConfig,
    outputter: IDocOutputter
  ): void;
}
