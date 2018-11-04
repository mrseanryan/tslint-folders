import { PackageFolder, PackageSubFolder } from "../../../model/ImportsBetweenPackagesRuleConfig";
import { DocConfig } from "../Config";

// TODO xxx Could move all filtering here - skipSubFolders

export class PackageFilter {
  private invalidPaths: string[] = [];
  private whiteListPaths: string[] = [];

  constructor(config: DocConfig) {
    this.invalidPaths = this.parseBlacklist(config.importBlacklist);
    this.whiteListPaths = this.parseWhitelist(config.importWhitelist);
  }

  private parseBlacklist(list: string): string[] {
    return list.split(",");
  }

  private parseWhitelist(list: string): string[] {
    return list.split(",").filter(entry => entry.length > 0);
  }

  private passesBlacklist(importPath: string): boolean {
    return this.invalidPaths.indexOf(importPath) < 0;
  }

  private passesWhitelist(importPath: string): boolean {
    return (
      this.whiteListPaths.length === 0 ||
      this.whiteListPaths.indexOf(importPath) >= 0
    );
  }

  get hasWhitelist(): boolean {
    return this.whiteListPaths.length > 0;
  }

  isImportPathOkForFolder(folder: PackageFolder): boolean {
    return this.passesBlacklist(folder.importPath);
  }

  isImportPathOkForSubFolder(folder: PackageSubFolder): boolean {
    return this.passesBlacklist(folder.importPath);
  }

  isImportPathOkForEdges(importPath: string): boolean {
    return this.passesBlacklist(importPath);
  }
}
