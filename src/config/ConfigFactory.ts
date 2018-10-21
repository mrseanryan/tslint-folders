import { ImportsBetweenPackagesRuleConfig } from "../model/ImportsBetweenPackagesRuleConfig";

export namespace ConfigFactory {
  export function createForBetweenPackages(
    options: any
  ): ImportsBetweenPackagesRuleConfig {
    if (options.length !== 1) {
      throw new Error(
        `tslint rule is misconfigured (tslint-folders-imports-between-packages) - options length is ${
          options.length
        }`
      );
    }

    const config: ImportsBetweenPackagesRuleConfig = options[0].config;

    // TODO xxx validate a bit (at least importPath should be set, allowedToImport should refer to recognised importPath)

    return config;
  }
}
