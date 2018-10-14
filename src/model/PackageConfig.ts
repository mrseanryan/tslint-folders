// Models the config in tslint.tslint-folders.JSON

export type PackageConfig = {
  checkImportsBetweenPackages: CheckImportsBetweenPackages;
  disallowImportFromSelf: DisallowImportFromSelf;
};

export type CheckImportsBetweenPackages = {
  enabled: true;
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
  allowedToImport: string[];
  subFolders: PackageSubFolder[];
};

export type PackageSubFolder = {
  description: string;
  importPath: string;
  allowedToImport: string[];
};
