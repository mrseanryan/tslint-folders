import * as ts from "typescript";

import {
    ImportsBetweenPackagesRuleConfig, PackageFolder, PackageSubFolder
} from "../model/ImportsBetweenPackagesRuleConfig";
import { GeneralRuleUtils } from "./GeneralRuleUtils";
import { PackageConfigHelper } from "./PackageConfigHelper";

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
    thisPackageLocation?: PackageLocation
  ): PackageLocation {
    const dirs = cleanPath(filePath).split("/");

    if (IS_DEBUG_ENABLED) {
      console.log(
        `\nchecking ${PathSource[pathSource]} against path:`,
        dirs.join(",")
      );
    }

    let packageName: string | null = null;
    switch (pathSource) {
      case PathSource.ImportText:
        {
          // take the 1st part of the path:
          // (ignore local directories that happen to have same name as a package)
          packageName = dirs[0];
        }
        break;
      case PathSource.SourceFilePath: {
        dirs.forEach(dir => {
          if (PackageConfigHelper.hasPackage(config, dir)) {
            if (packageName === null) {
              // take the 1st recognised folder:
              packageName = dir;
            } else if (IS_DEBUG_ENABLED) {
              // this can occur with package names like 'utils'
              console.warn(
                `import has more than one recognised package: [${packageName},${dir}]`
              );
            }
          }
        });
        break;
      }
      default: {
        throw new Error(`unhandled PathSource ${pathSource}`);
      }
    }

    if (
      packageName === null ||
      (pathSource === PathSource.SourceFilePath &&
        !PackageConfigHelper.hasPackage(config, packageName))
    ) {
      return {
        packageName: filePath
      };
    }

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

        return {
          packageName: filePath
        };
      }
    }

    if (!packageFolder) {
      return {
        packageName: packageName
      };
    }

    if (packageFolder.subFolders.length === 0) {
      return {
        packageName: packageName,
        packageFolder: packageFolder
      };
    }

    // TODO xxx extract fun?
    // determine packageSubFolder
    let packageSubFolder: PackageSubFolder | undefined;

    switch (pathSource) {
      case PathSource.ImportText:
        {
          // take the 1st part of the path:
          // (ignore local directories that happen to have same name as a package)
          packageName = dirs[0];

          const isImportingFromSubFolder = isRelativeImport(dirs[0]);
          if (isImportingFromSubFolder) {
            for (let i = 1; i < dirs.length; i++) {
              const subFolder = packageFolder.subFolders.find(
                folder => folder.importPath === dirs[i]
              );
              if (subFolder) {
                packageSubFolder = subFolder;

                packageName = subFolder.importPath;
                break;
              }
            }
          }
        }
        break;
      case PathSource.SourceFilePath: {
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
      packageName: packageName,
      packageFolder: packageFolder,
      packageSubFolder: packageSubFolder
    };
  }

  export function isRelativeImport(pathDir: string): boolean {
    return pathDir === "." || pathDir === "..";
  }

  function cleanPath(filePath: string): string {
    let cleaned = filePath.trim();

    cleaned = cleaned.replace(/['"]+/g, "");
    cleaned = cleaned.replace(/[\\]+/g, "\\");

    return cleaned;
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

  export function isPackageThirdParty(
    folderLocation: PackageLocation
  ): boolean {
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

  export function shouldIgnoreFile(
    node: ts.Node,
    ignorePaths: string[]
  ): boolean {
    const filePath = node.getSourceFile().fileName;

    return shouldIgnorePath(filePath, ignorePaths);
  }

  export function shouldIgnorePath(
    path: string,
    ignorePaths: string[]
  ): boolean {
    return ignorePaths.some(ignore => path.indexOf(ignore) >= 0);
  }
}
