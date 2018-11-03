import { DocConfig } from "../Config";

export class BlacklistFilter {
  private invalidPaths: string[] = [];

  constructor(config: DocConfig) {
    this.invalidPaths = this.parseBlacklist(config.importBlacklist);
  }

  private parseBlacklist(importBlacklist: string): string[] {
    return importBlacklist.split(",");
  }

  isImportPathOk(importPath: string): boolean {
    return this.invalidPaths.indexOf(importPath) < 0;
  }
}
