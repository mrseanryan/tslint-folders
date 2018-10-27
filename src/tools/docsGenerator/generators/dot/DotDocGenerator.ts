import {
    ImportsBetweenPackagesRuleConfig, PackageFolder, PackageSubFolder
} from "../../../../model/ImportsBetweenPackagesRuleConfig";
import { DocConfig } from "../../Config";
import { IDocGenerator } from "../../interfaces/IDocGenerator";
import { IDocOutputter } from "../../interfaces/IDocOutputter";
import { MapNameToId } from "./MapNameToId";

export class DotDocGenerator implements IDocGenerator {
  private mapNameToId = new MapNameToId();

  generateDoc(
    config: DocConfig,
    packageConfig: ImportsBetweenPackagesRuleConfig,
    outputter: IDocOutputter
  ): void {
    this.outputSectionSeparator("Header", outputter);
    this.outputHeader(outputter);

    this.outputSectionSeparator("Styling", outputter);
    this.outputStyling(outputter);

    this.outputSectionSeparator("Nodes", outputter);
    this.outputNodes(config, packageConfig, outputter);

    this.outputSectionSeparator("Edges", outputter);
    this.outputEdges(outputter);

    this.outputFooter(outputter);
  }

  private outputHeader(outputter: IDocOutputter) {
    outputter.outputLine("digraph prof {");
    outputter.increaseIndent();
    outputter.outputLine("ratio = fill;");
  }

  private outputFooter(outputter: IDocOutputter) {
    outputter.decreaseIndent();
    outputter.outputLine("}");
  }

  private outputStyling(outputter: IDocOutputter) {
    // TODO add optional extra styling (more colors)
    outputter.increaseIndent();
    outputter.outputLine("edge [color=black];");
    outputter.outputLine("node [style=filled color=gold1];");
    outputter.decreaseIndent();
  }

  private outputSectionSeparator(
    sectionName: string,
    outputter: IDocOutputter
  ) {
    outputter.outputLine(
      `/* ${sectionName} ================================= */`
    );
  }

  private outputNodes(
    config: DocConfig,
    packageConfig: ImportsBetweenPackagesRuleConfig,
    outputter: IDocOutputter
  ) {
    outputter.increaseIndent();

    packageConfig.checkImportsBetweenPackages.packages
      .filter(pkg => !pkg.isExternal)
      .forEach(pkg => {
        const packageName = pkg.importPath;

        this.outputNode(packageName, pkg.description, outputter);

        if (!config.skipSubFolders) {
          this.outputSubFolders(outputter, packageName, pkg.subFolders);
        } else {
          outputter.outputLine("");
        }
      });

    outputter.decreaseIndent();
  }

  private outputNode(
    packageName: string,
    description: string,
    outputter: IDocOutputter,
    prefix?: string
  ) {
    const packageId = this.mapNameToId.getId(`${prefix}_${packageName}`);

    // TODO xxx label is too long - is there a way to add an annotation?
    outputter.outputLine(
      `P${packageId} [label="${packageName} - ${description}"]`
    );
  }

  private outputEdges(outputter: IDocOutputter) {
    // xxx
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
    packageName: string,
    subFolders: PackageSubFolder[]
  ) {
    if (subFolders.length === 0) {
      outputter.outputLine("");
      return;
    }

    outputter.increaseIndent();

    outputter.outputLine("/*sub folders*/");

    outputter.increaseIndent();

    subFolders.forEach(folder => {
      this.outputNode(
        folder.importPath,
        folder.description,
        outputter,
        packageName
      );

      outputter.outputLine("");
    });

    outputter.decreaseIndent();
    outputter.decreaseIndent();
  }
}
