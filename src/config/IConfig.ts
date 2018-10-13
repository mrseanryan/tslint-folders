import { FolderNameToConfigMap } from "../model/FolderNameToConfigMap";

export interface IConfig {
    readonly folderToPackageLevel: FolderNameToConfigMap;
}
