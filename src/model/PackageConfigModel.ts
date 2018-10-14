import {
    DisallowImportFromSelf, PackageConfig, PackageFolder, PackageSubFolder
} from "./PackageConfig";

// OO wrappers of the JSON config

// export class PackageConfigModel {
//   constructor(readonly config: PackageConfig) {
//     this.disallowImportsFromSelf = new DisallowImportFromSelfModel(
//       config.disallowImportFromSelf
//     );
//     this.folders = config.checkImportsBetweenPackages.packages.map(
//       packageConfig => new PackageFolderModel(packageConfig)
//     );
//   }

//   readonly disallowImportsFromSelf: DisallowImportFromSelfModel;
//   readonly folders: PackageFolderModel[];
// }

// export class DisallowImportFromSelfModel {
//   constructor(readonly config: DisallowImportFromSelf) {}
// }

// export class PackageFolderModel {
//   constructor(readonly config: PackageFolder) {
//     this.subFolders = config.subFolders.map(
//       subFolder => new PackageSubFolderModel(subFolder)
//     );
//   }

//   readonly subFolders: PackageSubFolderModel[];
// }

// export class PackageSubFolderModel {
//   constructor(readonly config: PackageSubFolder) {}
// }
