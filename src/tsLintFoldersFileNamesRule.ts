import * as path from "path";
import * as Lint from "tslint";
import * as ts from "typescript";

import { ConfigFactory } from "./config/ConfigFactory";
import { Casing } from "./model/FilenamesRuleConfig";
import { EnumUtils } from "./utils/EnumUtils";
import { FilenameCasingUtils } from "./utils/FilenameCasingUtils";
import { ImportRuleUtils } from "./utils/ImportRuleUtils";

export const FILE_NAMES_RULE_ID = "tslint-folders-file-names";

/** Custom version of the standard file-name-casing rule, that allows for *multiple* casings.
 * ref: https://github.com/palantir/tslint/blob/master/src/rules/fileNameCasingRule.ts
 */
export class Rule extends Lint.Rules.AbstractRule {
  private static FAILURE_STRING(expectedCasings: Casing[]): string {
    const stylizedCasings = expectedCasings
      .map(casing => this.stylizedNameForCasing(casing))
      .join(" or ");

    // include the rule ID, to make it easier to disable
    return `File name must be ${stylizedCasings} (${FILE_NAMES_RULE_ID})`;
  }

  private static stylizedNameForCasing(casing: Casing): string {
    switch (casing) {
      case Casing.CamelCase:
        return "camelCase";
      case Casing.PascalCase:
        return "PascalCase";
      case Casing.KebabCase:
        return "kebab-case";
      case Casing.SnakeCase:
        return "snake_case";
      default:
        throw new Error(`unhandled casing ${casing}`);
    }
  }

  apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    const config = ConfigFactory.createForFilenames(this.getOptions());

    if (
      ImportRuleUtils.shouldIgnorePath(sourceFile.fileName, config.ignorePaths)
    ) {
      return [];
    }

    const parsedPath = path.parse(sourceFile.fileName);
    const filename = parsedPath.name;

    const isAnAllowedCasing = config.casings.some(casingName => {
      const casing = EnumUtils.parseCasing(casingName);

      const isAllowed = FilenameCasingUtils.isCased(filename, casing);

      return isAllowed;
    });

    if (!isAnAllowedCasing) {
      return [
        new Lint.RuleFailure(
          sourceFile,
          0,
          0,
          Rule.FAILURE_STRING(config.casings),
          FILE_NAMES_RULE_ID
        )
      ];
    }
    return [];
  }
}
