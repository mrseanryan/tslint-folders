import { ImportsBetweenPackagesRuleConfig } from "../../../model/ImportsBetweenPackagesRuleConfig";
import { DocConfig } from "../Config";
import { IDocOutputter } from "./IDocOutputter";

export interface IDocGenerator {
  generateDoc(
    config: DocConfig,
    packageConfig: ImportsBetweenPackagesRuleConfig,
    outputter: IDocOutputter
  ): void;
}
