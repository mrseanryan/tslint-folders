import * as path from "path";
import * as ts from "typescript";

import { existsSync, readFileSync } from "fs";

export interface TsConfigPaths {
    [glob: string]: string[];
}

export interface TsConfig {
    baseUrl: string;
    paths: TsConfigPaths;
    include: string[];
}

export namespace TsConfigParser {
    // Parse config in given folder, or some parent folder
    export function parseConfigNear(thisPath: string): TsConfig {
        let basePath = path.resolve(path.dirname(thisPath));

        while (existsSync(basePath)) {
            const possibleTsConfigPath = path.join(basePath, "tsconfig.json");

            if (existsSync(possibleTsConfigPath)) {
                return loadTsConfig(possibleTsConfigPath, basePath);
            }

            basePath = path.join(basePath, "..");
        }

        throw new Error(
            "Cannot find a tsconfig.json - it should be in some parent directory of all TypeScript files."
        );
    }

    const loadTsConfig = (tsconfigPath: string, tsconfigDir: string): TsConfig => {
        const { baseUrl, paths, include } = parseTsConfig(tsconfigPath);

        const resolvedBaseUrl = path.join(tsconfigDir, baseUrl);

        return { baseUrl: resolvedBaseUrl, paths, include };
    };

    const parseTsConfig = (tsconfigPath: string): TsConfig => {
        const basePath = path.resolve(path.dirname(tsconfigPath));

        try {
            const parseJsonResult = ts.parseConfigFileTextToJson(
                tsconfigPath,
                readFileSync(tsconfigPath, { encoding: "utf8" })
            );

            if (parseJsonResult.error) throw parseJsonResult.error;

            const result = ts.parseJsonConfigFileContent(parseJsonResult.config, ts.sys, basePath);
            if (result.errors.length) throw result.errors;

            return {
                baseUrl: result.raw?.compilerOptions?.baseUrl || ".",
                paths: result.raw?.compilerOptions?.paths,
                include: result.raw?.include
            };
        } catch (e) {
            throw new Error(`Cannot parse '${tsconfigPath}'. ${JSON.stringify(e)}`);
        }
    };
}
