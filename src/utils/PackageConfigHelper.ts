import { PackageConfig } from "../model/PackageConfig";

export namespace PackageConfigHelper {
  export function getPackage(config: PackageConfig, importPath: string) {
    if (!hasPackage(config, importPath)) {
      throw new Error(
        `config does not have a PackageFolder for importPath '${importPath}'`
      );
    }
    const packages = config.checkImportsBetweenPackages.packages.filter(
      pkg => pkg.importPath === importPath
    );

    if (packages.length === 1) {
      return packages[0];
    }

    if (packages.length > 1) {
      throw new Error(
        `config has multiple PackageFolder's for importPath '${importPath}'`
      );
    }

    throw new Error(
      `config does not have a PackageFolder for importPath '${importPath}'`
    );
  }

  export function hasPackage(
    config: PackageConfig,
    importPath: string
  ): boolean {
    return config.checkImportsBetweenPackages.packages.some(
      pkg => pkg.importPath === importPath
    );
  }
}
