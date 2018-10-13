import * as Lint from "tslint";
import * as ts from "typescript";

import { GeneralRuleUtils } from "./utils/GeneralRuleUtils";
import { ImportRuleUtils, PathSource } from "./utils/ImportRuleUtils";

const RULE_ID = "tslint-folders-imports-from-self";

export class Rule extends Lint.Rules.AbstractRule {
    apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        const walker = new ImportsWalker(sourceFile, this.getOptions());
        this.applyWithWalker(walker);

        return walker.getFailures();
    }
}

class ImportsWalker extends Lint.RuleWalker {
    private config = ImportRuleUtils.getConfig();

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
        - determine this files package level
        - if ThirdParty then skip
        - disallow import from self
        - determine package level of the import
        - enforce ImportRecognised.Deny
        - disallow import at same level
        - disallow import at higher level
        */

        const {
            folderConfig: thisFolderConfig,
            packageName: thisPackageName
        } = ImportRuleUtils.determinePackageLevelFromPath(
            node.getSourceFile().fileName,
            RULE_ID,
            this.config,
            PathSource.SourceFilePath
        );

        if (ImportRuleUtils.isThisPackageThirdParty(thisFolderConfig, node, thisPackageName)) {
            return;
        }

        const {
            folderConfig: importConfig,
            packageName: importPackageName
        } = ImportRuleUtils.determinePackageLevelFromPath(text, RULE_ID, this.config, PathSource.ImportText);

        ImportRuleUtils.logPackageAndImport(node, thisPackageName, thisFolderConfig, importPackageName, importConfig);

        if (thisFolderConfig.packageLevel === importConfig.packageLevel) {
            if (thisPackageName === importPackageName) {
                // This practice is common in PE and test files
                if (thisPackageName !== "projectionalEditor" && !ImportRuleUtils.isInTestFile(node)) {
                    this.addFailureAtNode(
                        node,
                        GeneralRuleUtils.buildFailureString(
                            "do not import a package from itself - use a relative path",
                            RULE_ID
                        )
                    );
                }
            }
        }
    }
}
