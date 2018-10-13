import * as ts from "typescript";

import { ConfigFactory } from "../config/ConfigFactory";
import { IConfig } from "../config/IConfig";
import { FolderConfig } from "../model/FolderNameToConfigMap";
import { PackageLevel } from "../model/PackageLevel";
import { GeneralRuleUtils } from "./GeneralRuleUtils";

export enum PathSource {
  SourceFilePath,
  ImportText
}

export namespace ImportRuleUtils {
  export const IS_DEBUG_ENABLED = false;

  export function getConfig(): IConfig {
    return ConfigFactory.create();
  }

  export function isInTestFile(node: ts.Node): boolean {
    const filePath = node.getSourceFile().fileName;
    return GeneralRuleUtils.isInTestFile(filePath);
  }

  export function determinePackageLevelFromPath(
    filePath: string,
    ruleId: string,
    config: IConfig,
    pathSource: PathSource
  ): { folderConfig: FolderConfig; packageName: string } {
    const dirs = cleanPath(filePath).split("/");

    const map = config.folderToPackageLevel.map;

    if (IS_DEBUG_ENABLED) {
      console.log(
        `checking ${PathSource[pathSource]} against map:`,
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
          if (map.has(dir)) {
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

    if (packageName === null || !map.has(packageName)) {
      return {
        folderConfig: {
          packageLevel: PackageLevel.ThirdParty
        },
        packageName: filePath
      };
    }

    const folderConfig = map.get(packageName);

    if (folderConfig === undefined) {
      GeneralRuleUtils.buildFailureString(
        `unexpected: import had a recognised package: [${packageName}] but could not determine the level`,
        ruleId
      );
      return {
        folderConfig: {
          packageLevel: PackageLevel.ThirdParty
        },
        packageName: packageName
      };
    }

    return { folderConfig: folderConfig, packageName: packageName };
  }

  function cleanPath(filePath: string): string {
    let cleaned = filePath.trim();

    cleaned = cleaned.replace(/['"]+/g, "");
    cleaned = cleaned.replace(/[\\]+/g, "\\");

    return cleaned;
  }

  export function isThisPackageThirdParty(
    thisFolderConfig: FolderConfig,
    node: ts.Node,
    thisPackageName: string
  ): boolean {
    if (thisFolderConfig.packageLevel === PackageLevel.ThirdParty) {
      if (IS_DEBUG_ENABLED) {
        console.log(
          node.getSourceFile().fileName,
          "- this package ThirdParty!",
          thisPackageName,
          PackageLevel[thisFolderConfig.packageLevel]
        );
      }
      return true;
    }

    return false;
  }

  export function logPackageAndImport(
    node: ts.Node,
    thisPackageName: string,
    thisFolderConfig: FolderConfig,
    importPackageName: string,
    importConfig: FolderConfig
  ) {
    if (IS_DEBUG_ENABLED) {
      console.log(
        node.getSourceFile().fileName,
        "- this package:",
        thisPackageName,
        PackageLevel[thisFolderConfig.packageLevel],
        "- import:",
        importPackageName,
        PackageLevel[importConfig.packageLevel]
      );
    }
  }
}
