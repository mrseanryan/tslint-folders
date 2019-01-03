import * as Lint from "tslint";
import * as ts from "typescript";

import { ConfigFactory } from "./config/ConfigFactory";
import {
    CheckImportsBetweenPackages,
    PackageFolder
} from "./model/ImportsBetweenPackagesRuleConfig";
import { GeneralRuleUtils } from "./utils/GeneralRuleUtils";
import { ImportRuleUtils, PathSource } from "./utils/ImportRuleUtils";

export const IMPORTS_BETWEEN_PACKAGES_RULE_ID = "tsf-folders-imports-between-packages";

const DISALLOW_IMPORT_FROM_SELF_MESSAGE =
    "do not import a package from itself - use a relative path";

const DISALLOW_IMPORT_FROM_BANNED_MESSAGE = "do not use a banned import path from package";

export class TsfImportsBetweenPackagesRule extends Lint.Rules.AbstractRule {
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
            IMPORTS_BETWEEN_PACKAGES_RULE_ID,
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
            IMPORTS_BETWEEN_PACKAGES_RULE_ID,
            config,
            PathSource.ImportText,
            thisPackageLocation
        );

        ImportRuleUtils.logPackageAndImport(node, thisPackageLocation, importPackageLocation);

        const isImportRecognised = !ImportRuleUtils.isPackageThirdParty(importPackageLocation);

        if (
            isImportRecognised &&
            importPackageLocation.packageName === thisPackageLocation.packageName &&
            config.disallowImportFromSelf.enabled &&
            !ImportRuleUtils.shouldIgnoreFile(node, config.disallowImportFromSelf.ignorePaths)
        ) {
            this.addFailureAtNode(
                node,
                GeneralRuleUtils.buildFailureString(
                    DISALLOW_IMPORT_FROM_SELF_MESSAGE,
                    IMPORTS_BETWEEN_PACKAGES_RULE_ID
                )
            );
            return;
        }

        if (
            isImportRecognised &&
            config.checkImportsBetweenPackages.enabled &&
            !ImportRuleUtils.shouldIgnoreFile(node, config.checkImportsBetweenPackages.ignorePaths)
        ) {
            if (!thisPackageLocation.packageFolder || !importPackageLocation.packageFolder) {
                return;
            }

            if (this.hasBannedImportPattern(config.checkImportsBetweenPackages, text, node)) {
                return;
            }

            if (importPackageLocation.packageFolder === thisPackageLocation.packageFolder) {
                if (!config.checkImportsBetweenPackages.checkSubFoldersEnabled) {
                    return;
                }

                // TODO xxx extract fun?
                // check sub-folders

                if (
                    thisPackageLocation.packageSubFolder &&
                    importPackageLocation.packageSubFolder &&
                    thisPackageLocation.packageSubFolder.importPath !==
                        importPackageLocation.packageSubFolder.importPath
                ) {
                    if (
                        thisPackageLocation.packageSubFolder.allowedToImport.some(
                            allowed => allowed === "*"
                        )
                    ) {
                        return;
                    }

                    if (
                        !thisPackageLocation.packageSubFolder.allowedToImport.some(allowed => {
                            return importPackageLocation.packageSubFolder!.importPath === allowed;
                        })
                    ) {
                        const failureMessage = `'${thisPackageLocation.packageName}' sub folder '${
                            thisPackageLocation.packageSubFolder.importPath
                        }' is not allowed to import from '${
                            importPackageLocation.packageSubFolder.importPath
                        }'`;

                        this.addFailureAtNodeWithMessage(node, failureMessage);
                    }
                }
            } else {
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
                    }' is not allowed to import from '${importPackageLocation.packageName}'`;

                    this.addFailureAtNodeWithMessage(node, failureMessage);
                }
            }
        }
    }

    private hasBannedImportPattern(
        checkImportsBetweenPackages: CheckImportsBetweenPackages,
        text: string,
        node: ts.Node
    ): boolean {
        const bannedImports = this.buildListOfBannedImports(checkImportsBetweenPackages);

        if (bannedImports && bannedImports.some(ban => text.indexOf(ban) >= 0)) {
            this.addFailureAtNode(
                node,
                GeneralRuleUtils.buildFailureString(
                    DISALLOW_IMPORT_FROM_BANNED_MESSAGE,
                    IMPORTS_BETWEEN_PACKAGES_RULE_ID
                )
            );
            return true;
        }

        return false;
    }

    private buildListOfBannedImports(
        checkImportsBetweenPackages: CheckImportsBetweenPackages
    ): string[] {
        const { ban, banBlacklist, packages } = checkImportsBetweenPackages;

        if (!ban) {
            return [];
        }

        const bannedImports: string[] = [];

        packages
            .filter(pkg => !banBlacklist || !banBlacklist.some(b => pkg.importPath === b))
            .forEach(pkg => {
                ban.forEach(b => {
                    bannedImports.push(b.replace("{PACKAGE}", pkg.importPath));
                });
            });

        return bannedImports;
    }

    private addFailureAtNodeWithMessage(node: ts.Node, failureMessage: string) {
        this.addFailureAtNode(
            node,
            GeneralRuleUtils.buildFailureString(failureMessage, IMPORTS_BETWEEN_PACKAGES_RULE_ID)
        );
    }
}
