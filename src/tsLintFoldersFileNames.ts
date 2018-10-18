// tslintFoldersFileNames
import * as path from "path";
import * as Lint from "tslint";
import * as ts from "typescript";

/*
enum Casing {
    CamelCase = "camel-case",
    PascalCase = "pascal-case",
    KebabCase = "kebab-case",
    SnakeCase = "snake-case",
}
*/

const RULE_ID = "tslint-folders-file-names";

/** Custom version of the standard file-name-casing rule, that allows for multiple casings.
 * ref: https://github.com/palantir/tslint/blob/master/src/rules/fileNameCasingRule.ts
 */
export class Rule extends Lint.Rules.AbstractRule {
  // include the rule ID, to make it easier to disable
  static FAILURE_STRING: string = `file names should be pascal or camel case (${RULE_ID})`;

  apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    const parsedPath = path.parse(sourceFile.fileName);
    // TODO xxx add ignorePaths[]
    if (parsedPath.dir.includes("scripts/")) {
      return [];
    }

    const filename = parsedPath.name;

    // TODO xxx add casing, like standard rule:
    /*
    "tslint-folders-file-names": [true, { 
      "file-name-casing": ["camel-case","pascal-case"]
    }],
    */

    // camel-case OR pascal-case
    if (!/^[a-zA-Z0-9.'\\s]+$/.test(filename)) {
      return [
        // TODO xxx use node, not fixed row indexes
        new Lint.RuleFailure(sourceFile, 0, 3, Rule.FAILURE_STRING, RULE_ID)
      ];
    }
    return [];
  }
}
