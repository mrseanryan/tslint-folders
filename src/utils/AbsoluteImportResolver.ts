import { Dirent, existsSync } from "fs";
import * as path from "path";

import { ImportsBetweenPackagesRuleConfig } from "../tslint-folders";
import { DirUtils } from "./DirUtils";
import { PackageConfigHelper } from "./PackageConfigHelper";
import { TsConfig } from "./TsConfigParser";

export const IS_DEBUG_ENABLED = false;

// Resolves an absolute file path, to a 'package' path, as specified in tsconfig.json
export namespace AbsoluteImportResolver {
    export function resolvePathToPackageName(
        filePath: string,
        tsConfig: TsConfig,
        config: ImportsBetweenPackagesRuleConfig
    ): string | null {
        if (tsConfig.paths) {
            const packageNames = Object.keys(tsConfig.paths);

            let resolvedToPackageName: string | null = null;
            packageNames.forEach((packageName) => {
                const paths = tsConfig.paths[packageName].map((x) => x.replace(/\/\*$/, ""));

                if (
                    paths.some((partialPath) => {
                        const absolutePaths = tsConfig.include
                            .map((include) => {
                                const joined = path.join(tsConfig.baseUrl, include, partialPath);
                                return DirUtils.convertWindowsToUnix(joined); // needs to be Unix style, to handle multicomponent paths like 'my-editor/api'
                            })
                            .filter((p) => existsSync(p));

                        return absolutePaths.some((abs) => filePath.startsWith(abs));
                    })
                ) {
                    if (resolvedToPackageName && IS_DEBUG_ENABLED) {
                        console.warn(`Multiple configured paths matching to path '${filePath}'`);
                    } else {
                        resolvedToPackageName = packageName.replace(/\/\*$/, "");
                    }
                }
            });

            if (resolvedToPackageName) {
                return resolvedToPackageName;
            }
        }

        // Fallback, in case 'paths' not set, or incomplete:
        return resolvePathToPackageNameViaSplitting(filePath, config);
    }

    function resolvePathToPackageNameViaSplitting(
        pathToSplit: string,
        config: ImportsBetweenPackagesRuleConfig
    ): string | null {
        const dirs = DirUtils.splitPath(pathToSplit);
        let packageName: string | null = null;

        dirs.forEach((dir) => {
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

        return packageName;
    }
}
