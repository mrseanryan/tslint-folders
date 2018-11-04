import {
    ImportsBetweenPackagesRuleConfig, PackageFolder, PackageSubFolder
} from "../../../../model/ImportsBetweenPackagesRuleConfig";
import { DocConfig } from "../../Config";
import { IDocGenerator } from "../../interfaces/IDocGenerator";
import { IDocOutputter } from "../../interfaces/IDocOutputter";
import { PackageFilter } from "../../utils/PackageFilter";
import { DocGeneratorBase } from "../shared/DocGeneratorBase";

const SECTION_SEPARATOR = "_____";

export class TextDocGenerator extends DocGeneratorBase
  implements IDocGenerator {
  generateDoc(packageConfig: ImportsBetweenPackagesRuleConfig): void {
    this.outputter.outputLine(SECTION_SEPARATOR);

    packageConfig.checkImportsBetweenPackages.packages
      .filter(
        pkg => !pkg.isExternal && this.filter.isImportPathOkForFolder(pkg)
      )
      .forEach(pkg => {
        const packageName = pkg.importPath;

        this.outputter.outputLine(`${packageName} - ${pkg.description}`);

        this.outputter.increaseIndent();

        this.outputAllowedImports(pkg);

        this.outputSubFolders(
          pkg.subFolders.filter(sub =>
            this.filter.isImportPathOkForSubFolder(sub)
          )
        );

        this.outputter.decreaseIndent();
      });

    this.outputter.outputLine(SECTION_SEPARATOR);
  }

  private outputAllowedImports(pkg: PackageFolder) {
    const allowedToImport = this.outputAllowedToImport(pkg.allowedToImport);
    this.outputter.outputLine(`--> ${allowedToImport}`);
  }

  private outputAllowedToImport(allowed: string[]): string {
    if (allowed.some(value => value === "*")) {
      return "(any)";
    }

    return allowed.length > 0 ? `${allowed.join(", ")}` : "(none)";
  }

  private outputSubFolders(subFolders: PackageSubFolder[]) {
    if (subFolders.length === 0) {
      this.outputter.outputLine("");
      return;
    }

    this.outputter.increaseIndent();

    this.outputter.outputLine("folders:");

    this.outputter.increaseIndent();

    subFolders.forEach(folder => {
      this.outputter.outputLine(`${folder.importPath} - ${folder.description}`);

      const allowedToImport = this.outputAllowedToImport(
        folder.allowedToImport
      );

      this.outputter.increaseIndent();
      this.outputter.outputLine(`--> ${allowedToImport}`);
      this.outputter.decreaseIndent();
      this.outputter.outputLine("");
    });

    this.outputter.decreaseIndent();
    this.outputter.decreaseIndent();
  }
}
