import { PackageLevel } from "./PackageLevel";
import { RecognisedImportPolicy } from "./RecognisedImportPolicy";

export type FolderConfig = {
    packageLevel: PackageLevel;
    recognisedImportPolicy?: RecognisedImportPolicy;
};

export class FolderNameToConfigMap {
    readonly map: Map<string, FolderConfig> = new Map<string, FolderConfig>();
}
