import { PackageConfig } from "../model/PackageConfig";

export namespace ConfigFactory {
  // tslint:disable-next-line:no-any
  export function create(options: any): PackageConfig {
    if (options.length !== 1) {
      throw new Error(
        `tslint rule is misconfigured (tslint-folders-imports-between-packages) - options length is ${
          options.length
        }`
      );
    }

    const config: PackageConfig = options[0].config;

    // TODO xxx validate a bit (at least importPath should be set, allowedToImport should refer to recognised importPath)

    return config;
  }
}
