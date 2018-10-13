import { FolderNameToConfigMap } from "../../model/FolderNameToConfigMap";
import { PackageLevel } from "../../model/PackageLevel";
import { RecognisedImportPolicy } from "../../model/RecognisedImportPolicy";
import { IConfig } from "../IConfig";
import { IConfigSource } from "../IConfigSource";

export class HardCodedConfigSource implements IConfigSource {
  getConfig(): IConfig {
    return {
      folderToPackageLevel: this.createMap()
    };
  }

  private createMap(): FolderNameToConfigMap {
    const map = new FolderNameToConfigMap();

    map.map.set("contact-area", { packageLevel: PackageLevel.Area });
    map.map.set("todo-area", { packageLevel: PackageLevel.Area });

    // 'grid' is configured to not import any recogmised packages:
    map.map.set("grid-package", {
      packageLevel: PackageLevel.Grid,
      recognisedImportPolicy: RecognisedImportPolicy.Deny
    });
    map.map.set("shell", { packageLevel: PackageLevel.Shell });
    map.map.set("utils", { packageLevel: PackageLevel.Utils });

    return map;
  }
}
