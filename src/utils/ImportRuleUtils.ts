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
    pathSource: PathSource
  ): PackageLocation {
    const dirs = cleanPath(filePath).split("/");

    if (IS_DEBUG_ENABLED) {
      console.log(
        `checking ${PathSource[pathSource]} against path:`,
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
      !PackageConfigHelper.hasPackage(config, packageName)
    ) {
      return {
        packageName: filePath
      };
    }

    let packageFolder: PackageFolder | undefined;
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

    if (!packageFolder) {
      return {
        packageName: packageName
      };
    }

    // TODO xxx determine packageSubFolder

    return { packageName: packageName, packageFolder: packageFolder };
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
