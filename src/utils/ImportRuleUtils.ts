import * as ts from "typescript";

import {
    ImportsBetweenPackagesRuleConfig,
    PackageFolder,
    PackageSubFolder
} from "../model/ImportsBetweenPackagesRuleConfig";

import { AbsoluteImportResolver } from "./AbsoluteImportResolver";
import { DirUtils } from "./DirUtils";
import { GeneralRuleUtils } from "./GeneralRuleUtils";
import { PackageConfigHelper } from "./PackageConfigHelper";
import { TsConfig } from "./TsConfigParser";

export enum PathSource {
    SourceFilePath,
    ImportText
}

export type PackageLocation = {
    packageName: string;
    packageFolder?: PackageFolder;
    packageSubFolder?: PackageSubFolder;
};

export namespace ImportRuleUtils {
    export const IS_DEBUG_ENABLED = false;

    export function determinePackageLocationFromPath(
        filePath: string,
        ruleId: string,
        config: ImportsBetweenPackagesRuleConfig,
        pathSource: PathSource,
        tsConfig: TsConfig,
        thisPackageLocation?: PackageLocation
    ): PackageLocation {
        const dirs = DirUtils.splitPath(filePath);

        if (IS_DEBUG_ENABLED) {
            console.log(`\nchecking ${PathSource[pathSource]} against path:`, dirs.join(","));
        }

        let packageName = determinePackageName(config, filePath, pathSource, tsConfig);

        if (
            packageName === null ||
            (pathSource === PathSource.SourceFilePath &&
                !PackageConfigHelper.hasPackage(config, packageName))
        ) {
            return {
                packageName: filePath
            };
        }

        const packageFolderAndName = determinePackageFolderAndName(
            config,
            dirs,
            filePath,
            thisPackageLocation,
            packageName,
            pathSource,
            ruleId
        );
        packageName = packageFolderAndName.packageName;

        if (!packageFolderAndName.packageFolder) {
            return {
                packageName: packageName
            };
        }

        if (packageFolderAndName.packageFolder.subFolders.length === 0) {
            return {
                packageName: packageName,
                packageFolder: packageFolderAndName.packageFolder
            };
        }

        return determinePackageLocationWithSubFolder(
            dirs,
            packageName,
            packageFolderAndName.packageFolder,
            pathSource
        );
    }

    // TODO xxx review - too many params!
    function determinePackageFolderAndName(
        config: ImportsBetweenPackagesRuleConfig,
        dirs: string[],
        filePath: string,
        thisPackageLocation: PackageLocation | undefined,
        packageName: string,
        pathSource: PathSource,
        ruleId: string
    ): {
        packageFolder: PackageFolder | undefined;
        packageName: string;
    } {
        let activePackageName: string = packageName;
        let packageFolder: PackageFolder | undefined;

        if (pathSource === PathSource.ImportText && isRelativeImport(dirs[0])) {
            if (!thisPackageLocation) {
                throw new Error(
                    "for path source = ImportText - expect thisPackageLocation to be set"
                );
            }

            // assumption: we are importing from 'this' package
            // (assuming is not ..'ing back into other package! - that would require 'virtual directories')
            packageFolder = thisPackageLocation!.packageFolder;
        } else {
            try {
                packageFolder = PackageConfigHelper.getPackage(config, packageName);
            } catch (error) {
                GeneralRuleUtils.buildFailureString(
                    `unexpected: import had a recognised package: [${packageName}] but could not find the PackageFolder in the config`,
                    ruleId
                );

                packageFolder = undefined;
                activePackageName = filePath;
            }
        }

        return {
            packageFolder: packageFolder,
            packageName: activePackageName
        };
    }

    function determinePackageName(
        config: ImportsBetweenPackagesRuleConfig,
        filePath: string,
        pathSource: PathSource,
        tsConfig: TsConfig
    ): string | null {
        let packageName: string | null = null;
        switch (pathSource) {
            case PathSource.ImportText:
                {
                    // take the 1st part of the path:
                    // (ignore local directories that happen to have same name as a package)
                    packageName = DirUtils.splitPath(filePath)[0];
                }
                break;
            case PathSource.SourceFilePath: {
                const pathName = AbsoluteImportResolver.resolvePathToPackageName(
                    filePath,
                    tsConfig,
                    config
                );
                if (pathName && PackageConfigHelper.hasPackage(config, pathName)) {
                    // take the 1st recognised folder:
                    packageName = pathName;
                }
                break;
            }
            default: {
                throw new Error(`unhandled PathSource ${pathSource}`);
            }
        }

        return packageName;
    }

    function determinePackageLocationWithSubFolder(
        dirs: string[],
        packageName: string,
        packageFolder: PackageFolder,
        pathSource: PathSource
    ): PackageLocation {
        let packageSubFolder: PackageSubFolder | undefined;
        let activePackageName = packageName;

        switch (pathSource) {
            case PathSource.ImportText:
                {
                    // take the 1st part of the path:
                    // (ignore local directories that happen to have same name as a package)
                    activePackageName = dirs[0];

                    const isImportingFromSubFolder = isRelativeImport(dirs[0]);
                    if (isImportingFromSubFolder) {
                        for (let i = 1; i < dirs.length; i++) {
                            const subFolder = packageFolder.subFolders.find(
                                folder => folder.importPath === dirs[i]
                            );
                            if (subFolder) {
                                packageSubFolder = subFolder;

                                activePackageName = subFolder.importPath;
                                break;
                            }
                        }
                    }
                }
                break;
            case PathSource.SourceFilePath: {
                // xxx

                let hasPackageDir = false;

                dirs.forEach(dir => {
                    if (packageSubFolder) {
                        return;
                    }

                    if (packageFolder!.importPath === dir) {
                        hasPackageDir = true;
                        return;
                    }

                    {
                        if (hasPackageDir) {
                            const subFolder = packageFolder!.subFolders.find(
                                folder => folder.importPath === dir
                            );
                            if (subFolder) {
                                packageSubFolder = subFolder;
                                return;
                            }
                        }
                    }
                });
                break;
            }
            default: {
                throw new Error(`unhandled PathSource ${pathSource}`);
            }
        }

        return {
            packageName: activePackageName,
            packageFolder: packageFolder,
            packageSubFolder: packageSubFolder
        };
    }

    export function isRelativeImport(pathDir: string): boolean {
        return pathDir === "." || pathDir === "..";
    }

    export function isThisPackageThirdParty(
        thisFolderLocation: PackageLocation,
        node: ts.Node
    ): boolean {
        if (isPackageThirdParty(thisFolderLocation)) {
            if (IS_DEBUG_ENABLED) {
                console.log(
                    node.getSourceFile().fileName,
                    "- this package ThirdParty!",
                    thisFolderLocation.packageName
                );
            }
            return true;
        }

        return false;
    }

    export function isPackageThirdParty(folderLocation: PackageLocation): boolean {
        return !folderLocation.packageFolder && !folderLocation.packageSubFolder;
    }

    export function logPackageAndImport(
        node: ts.Node,
        thisPackageLocation: PackageLocation,
        importPackageLocation: PackageLocation
    ) {
        if (IS_DEBUG_ENABLED) {
            console.log(
                node.getSourceFile().fileName,
                "- this package:",
                thisPackageLocation.packageName,
                getPackageName(thisPackageLocation.packageFolder),
                "- import:",
                importPackageLocation.packageName,
                getPackageName(importPackageLocation.packageFolder)
            );
        }
    }

    function getPackageName(packageFolder: PackageFolder | undefined): string {
        return packageFolder ? packageFolder.importPath : "(unknown)";
    }

    export function shouldIgnoreFile(node: ts.Node, ignorePaths: string[]): boolean {
        const filePath = node.getSourceFile().fileName;

        return shouldIgnorePath(filePath, ignorePaths);
    }

    export function shouldIgnorePath(path: string, ignorePaths: string[]): boolean {
        return ignorePaths.some(ignore => path.indexOf(ignore) >= 0);
    }
}
