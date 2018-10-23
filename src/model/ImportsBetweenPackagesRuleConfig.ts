/**
 * Models the config in tslint.tslint-folders.JSON
 * for rule 'tslint-folders-imports-between-packages'
 */
export type ImportsBetweenPackagesRuleConfig = {
  checkImportsBetweenPackages: CheckImportsBetweenPackages;
  disallowImportFromSelf: DisallowImportFromSelf;
};

export type CheckImportsBetweenPackages = {
  enabled: boolean;
  checkSubFoldersEnabled: boolean;
  ignorePaths: string[];
  packages: PackageFolder[];
};

export type DisallowImportFromSelf = {
  enabled: boolean;
  ignorePaths: string[];
};

export type PackageFolder = {
  description: string;
  importPath: string;
  isExternal: boolean;
  allowedToImport: string[];
  subFolders: PackageSubFolder[];
};

export type PackageSubFolder = {
  description: string;
  importPath: string;
  allowedToImport: string[];
};
