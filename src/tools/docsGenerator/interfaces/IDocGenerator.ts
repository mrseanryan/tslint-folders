import { ImportsBetweenPackagesRuleConfig } from "../../../model/ImportsBetweenPackagesRuleConfig";
import { DocConfig } from "../Config";
import { IDocOutputter } from "./IDocOutputter";

export interface IDocGenerator {
  generateDoc(packageConfig: ImportsBetweenPackagesRuleConfig): void;
}
