import * as Lint from "tslint";
import * as ts from "typescript";

import { ConfigFactory } from "./config/ConfigFactory";
import { GeneralRuleUtils } from "./utils/GeneralRuleUtils";
import { ImportRuleUtils, PathSource } from "./utils/ImportRuleUtils";
import { PackageConfigHelper } from "./utils/PackageConfigHelper";

const RULE_ID = "tslint-folders-imports-between-packages";

const DISALLOW_IMPORT_FROM_SELF_MESSAGE =
  "do not import a package from itself - use a relative path";

export class Rule extends Lint.Rules.AbstractRule {
  apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    const walker = new ImportsWalker(sourceFile, this.getOptions());
    this.applyWithWalker(walker);

    return walker.getFailures();
  }
}

class ImportsWalker extends Lint.RuleWalker {
  visitImportDeclaration(node: ts.ImportDeclaration) {
    this.validate(node, node.moduleSpecifier.getText());
  }

  visitImportEqualsDeclaration(node: ts.ImportEqualsDeclaration) {
    this.validate(node, node.moduleReference.getText());

    super.visitImportEqualsDeclaration(node);
  }

  private validate(node: ts.Node, text: string) {
    // algorithm:
    /*
        - determine this files PackageFolder, PackageSubFolder
        - if ThirdParty then skip
        - determine the PackageFolder, PackageSubFolder of the import
        - if ThirdParty then skip
        - disallowImportFromSelf -> disallow if same
        - check if the import is allowed
        */

    const config = ConfigFactory.createForBetweenPackages(this.getOptions());

    const thisPackageLocation = ImportRuleUtils.determinePackageLocationFromPath(
      node.getSourceFile().fileName,
      RULE_ID,
      config,
      PathSource.SourceFilePath
    );

    if (ImportRuleUtils.isThisPackageThirdParty(thisPackageLocation, node)) {
      return;
    }

    if (!thisPackageLocation.packageFolder) {
      throw new Error(
        "unexpected: this package is not ThirdParty, but has no packageFolder in its location"
      );
    }

    const importPackageLocation = ImportRuleUtils.determinePackageLocationFromPath(
      text,
      RULE_ID,
      config,
      PathSource.ImportText
    );

    ImportRuleUtils.logPackageAndImport(
      node,
      thisPackageLocation,
      importPackageLocation
    );

    const isImportRecognised = !ImportRuleUtils.isPackageThirdParty(
      importPackageLocation
    );

    if (
      isImportRecognised &&
      importPackageLocation.packageName === thisPackageLocation.packageName &&
      config.disallowImportFromSelf.enabled &&
      !ImportRuleUtils.shouldIgnoreFile(
        node,
        config.disallowImportFromSelf.ignorePaths
      )
    ) {
      this.addFailureAtNode(
        node,
        GeneralRuleUtils.buildFailureString(
          DISALLOW_IMPORT_FROM_SELF_MESSAGE,
          RULE_ID
        )
      );
      return;
    }

    if (
      isImportRecognised &&
      importPackageLocation.packageName !== thisPackageLocation.packageName &&
      config.checkImportsBetweenPackages.enabled &&
      !ImportRuleUtils.shouldIgnoreFile(
        node,
        config.checkImportsBetweenPackages.ignorePaths
      )
    ) {
      const thisPackageFolder = thisPackageLocation.packageFolder;
      if (thisPackageFolder.allowedToImport.find(allowed => allowed === "*")) {
        return;
      }

      if (
        !thisPackageFolder.allowedToImport.find(
          allowed => allowed === importPackageLocation.packageName
        )
      ) {
        const failureMessage = `'${
          thisPackageLocation.packageName
        }' is not allowed to import from '${
          importPackageLocation.packageName
        }'`;

        this.addFailureAtNode(
          node,
          GeneralRuleUtils.buildFailureString(failureMessage, RULE_ID)
        );
      }
    }
  }
}
