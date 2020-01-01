import * as Lint from "tslint";
import * as ts from "typescript";

import { ConfigFactory } from "./config/ConfigFactory";
import {
    CheckImportsBetweenPackages,
    ImportsBetweenPackagesRuleConfig
} from "./model/ImportsBetweenPackagesRuleConfig";
import { RuleId } from "./RuleId";
import { GeneralRuleUtils } from "./utils/GeneralRuleUtils";
import { ImportRuleUtils, PathSource } from "./utils/ImportRuleUtils";

const DISALLOW_IMPORT_FROM_SELF_MESSAGE =
    "do not import a package from itself - use a relative path";

const DISALLOW_IMPORT_FROM_BANNED_MESSAGE = "do not use a banned import path from package";

export class Rule extends Lint.Rules.AbstractRule {
    apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        const config = ConfigFactory.createForBetweenPackages(this.getOptions().ruleArguments);

        return this.applyWithFunction<ImportsBetweenPackagesRuleConfig>(sourceFile, walk, config);
    }
}

const walk = (ctx: Lint.WalkContext<ImportsBetweenPackagesRuleConfig>) => {
    return ts.forEachChild(ctx.sourceFile, checkNode);

    function checkNode(node: ts.Node): void {
        if (node.kind === ts.SyntaxKind.ImportDeclaration) {
            visitImportDeclaration(node as ts.ImportDeclaration, ctx);
        } else if (node.kind === ts.SyntaxKind.ImportEqualsDeclaration) {
            visitImportEqualsDeclaration(node as ts.ImportEqualsDeclaration, ctx);
        }

        return ts.forEachChild(node, checkNode);
    }
};

function visitImportDeclaration(
    node: ts.ImportDeclaration,
    ctx: Lint.WalkContext<ImportsBetweenPackagesRuleConfig>
) {
    validate(node, node.moduleSpecifier.getText(), ctx);
}

function visitImportEqualsDeclaration(
    node: ts.ImportEqualsDeclaration,
    ctx: Lint.WalkContext<ImportsBetweenPackagesRuleConfig>
) {
    validate(node, node.moduleReference.getText(), ctx);
}

function validate(
    node: ts.Node,
    text: string,
    ctx: Lint.WalkContext<ImportsBetweenPackagesRuleConfig>
) {
    // algorithm:
    /*
        - determine this files PackageFolder, PackageSubFolder
        - if ThirdParty then skip
        - determine the PackageFolder, PackageSubFolder of the import
        - if ThirdParty then skip
        - disallowImportFromSelf -> disallow if same
        - check if the import is allowed
        */

    const thisPackageLocation = ImportRuleUtils.determinePackageLocationFromPath(
        node.getSourceFile().fileName,
        RuleId.TsfFoldersImportsBetweenPackages,
        ctx.options,
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
        RuleId.TsfFoldersImportsBetweenPackages,
        ctx.options,
        PathSource.ImportText,
        thisPackageLocation
    );

    ImportRuleUtils.logPackageAndImport(node, thisPackageLocation, importPackageLocation);

    const isImportRecognised = !ImportRuleUtils.isPackageThirdParty(importPackageLocation);

    if (
        isImportRecognised &&
        importPackageLocation.packageName === thisPackageLocation.packageName &&
        ctx.options.disallowImportFromSelf.enabled &&
        !ImportRuleUtils.shouldIgnoreFile(node, ctx.options.disallowImportFromSelf.ignorePaths)
    ) {
        ctx.addFailureAtNode(
            node,
            GeneralRuleUtils.buildFailureString(
                DISALLOW_IMPORT_FROM_SELF_MESSAGE,
                RuleId.TsfFoldersImportsBetweenPackages
            )
        );
        return;
    }

    if (
        isImportRecognised &&
        ctx.options.checkImportsBetweenPackages.enabled &&
        !ImportRuleUtils.shouldIgnoreFile(node, ctx.options.checkImportsBetweenPackages.ignorePaths)
    ) {
        if (!thisPackageLocation.packageFolder || !importPackageLocation.packageFolder) {
            return;
        }

        if (hasBannedImportPattern(ctx.options.checkImportsBetweenPackages, text, node, ctx)) {
            return;
        }

        if (importPackageLocation.packageFolder === thisPackageLocation.packageFolder) {
            if (!ctx.options.checkImportsBetweenPackages.checkSubFoldersEnabled) {
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
                    const failureMessage = `'${thisPackageLocation.packageName}' sub folder '${thisPackageLocation.packageSubFolder.importPath}' is not allowed to import from '${importPackageLocation.packageSubFolder.importPath}'`;

                    addFailureAtNodeWithMessage(node, failureMessage, ctx);
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
                const failureMessage = `'${thisPackageLocation.packageName}' is not allowed to import from '${importPackageLocation.packageName}'`;

                addFailureAtNodeWithMessage(node, failureMessage, ctx);
            }
        }
    }
}

function hasBannedImportPattern(
    checkImportsBetweenPackages: CheckImportsBetweenPackages,
    text: string,
    node: ts.Node,
    ctx: Lint.WalkContext<ImportsBetweenPackagesRuleConfig>
): boolean {
    const bannedImports = buildListOfBannedImports(checkImportsBetweenPackages);

    if (bannedImports && bannedImports.some(ban => text.indexOf(ban) >= 0)) {
        ctx.addFailureAtNode(
            node,
            GeneralRuleUtils.buildFailureString(
                DISALLOW_IMPORT_FROM_BANNED_MESSAGE,
                RuleId.TsfFoldersImportsBetweenPackages
            )
        );
        return true;
    }

    return false;
}

function buildListOfBannedImports(
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

function addFailureAtNodeWithMessage(
    node: ts.Node,
    failureMessage: string,
    ctx: Lint.WalkContext<ImportsBetweenPackagesRuleConfig>
) {
    ctx.addFailureAtNode(
        node,
        GeneralRuleUtils.buildFailureString(failureMessage, RuleId.TsfFoldersImportsBetweenPackages)
    );
}
