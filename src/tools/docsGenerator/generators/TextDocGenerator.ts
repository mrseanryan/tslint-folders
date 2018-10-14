import { PackageConfig } from "../../../model/PackageConfig";
import { DocConfig } from "../Config";
import { IDocGenerator } from "../interfaces/IDocGenerator";
import { IDocOutputter } from "../interfaces/IDocOutputter";

const SECTION_SEPARATOR = "_____";

export class TextDocGenerator implements IDocGenerator {
  generateDoc(
    config: DocConfig,
    packageConfig: PackageConfig,
    outputter: IDocOutputter
  ): void {
    outputter.outputLine(SECTION_SEPARATOR);

    packageConfig.checkImportsBetweenPackages.packages.forEach(pkg => {
      const packageName = pkg.importPath;

      outputter.outputLine(`${packageName} - ${pkg.description}`);

      outputter.increaseIndent();

      const allowedToImport =
        pkg.allowedToImport.length > 0
          ? `${pkg.allowedToImport.join(", ")}`
          : "(none)";
      outputter.outputLine(`--> ${allowedToImport}`);

      outputter.decreaseIndent();

      outputter.outputLine("");
    });

    outputter.outputLine(SECTION_SEPARATOR);
  }
}
