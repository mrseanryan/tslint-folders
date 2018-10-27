import {
    ImportsBetweenPackagesRuleConfig, PackageFolder, PackageSubFolder
} from "../../../../model/ImportsBetweenPackagesRuleConfig";
import { DocConfig } from "../../Config";
import { IDocGenerator } from "../../interfaces/IDocGenerator";
import { IDocOutputter } from "../../interfaces/IDocOutputter";

const SECTION_SEPARATOR = "_____";

export class TextDocGenerator implements IDocGenerator {
  generateDoc(
    config: DocConfig,
    packageConfig: ImportsBetweenPackagesRuleConfig,
    outputter: IDocOutputter
  ): void {
    outputter.outputLine(SECTION_SEPARATOR);

    packageConfig.checkImportsBetweenPackages.packages
      .filter(pkg => !pkg.isExternal)
      .forEach(pkg => {
        const packageName = pkg.importPath;

        outputter.outputLine(`${packageName} - ${pkg.description}`);

        outputter.increaseIndent();

        this.outputAllowedImports(pkg, outputter);

        if (!config.skipSubFolders) {
          this.outputSubFolders(outputter, pkg.subFolders);
        } else {
          outputter.outputLine("");
        }

        outputter.decreaseIndent();
      });

    outputter.outputLine(SECTION_SEPARATOR);
  }

  private outputAllowedImports(pkg: PackageFolder, outputter: IDocOutputter) {
    const allowedToImport = this.outputAllowedToImport(pkg.allowedToImport);
    outputter.outputLine(`--> ${allowedToImport}`);
  }

  private outputAllowedToImport(allowed: string[]): string {
    if (allowed.some(value => value === "*")) {
      return "(any)";
    }

    return allowed.length > 0 ? `${allowed.join(", ")}` : "(none)";
  }

  private outputSubFolders(
    outputter: IDocOutputter,
    subFolders: PackageSubFolder[]
  ) {
    if (subFolders.length === 0) {
      outputter.outputLine("");
      return;
    }

    outputter.increaseIndent();

    outputter.outputLine("folders:");

    outputter.increaseIndent();

    subFolders.forEach(folder => {
      outputter.outputLine(`${folder.importPath} - ${folder.description}`);

      const allowedToImport = this.outputAllowedToImport(
        folder.allowedToImport
      );

      outputter.increaseIndent();
      outputter.outputLine(`--> ${allowedToImport}`);
      outputter.decreaseIndent();
      outputter.outputLine("");
    });

    outputter.decreaseIndent();
    outputter.decreaseIndent();
  }
}
