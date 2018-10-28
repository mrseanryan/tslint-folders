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

    const packageFolders = packageConfig.checkImportsBetweenPackages.packages;

    this.outputSectionSeparator("Nodes", outputter);
    this.outputNodes(config, packageFolders, outputter);

    this.outputSectionSeparator("Edges", outputter);
    this.outputEdges(config, packageFolders, outputter);

    this.outputFooter(outputter);
  }

  private outputHeader(outputter: IDocOutputter) {
    outputter.outputLine("digraph prof {");
    outputter.increaseIndent();
    // forcelabels, to ensure xlabels are always placed (even if they overlap)
    outputter.outputLine("forcelabels = true;");
    outputter.outputLine("ratio = fill;");
  }

  private outputFooter(outputter: IDocOutputter) {
    outputter.decreaseIndent();
    outputter.outputLine("}");
  }

  // TODO xxx extract to DotStyleGenerator.ts
  private outputStyling(outputter: IDocOutputter) {
    // TODO add optional extra styling (more colors) via colorscheme
    outputter.increaseIndent();
    this.outputDefaultNodeStyling(outputter);
    outputter.decreaseIndent();
  }

  private outputStylingForExternalNode(outputter: IDocOutputter) {
    outputter.outputLine("node [fontcolor=black];");
    outputter.outputLine("node [shape=Msquare, style=dashed, color=black];");
  }

  private outputDefaultNodeStyling(outputter: IDocOutputter) {
    outputter.outputLine("edge [color=black];");
    outputter.outputLine("node [style=filled color=gold1];");
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
    packageFolders: PackageFolder[],
    outputter: IDocOutputter
  ) {
    outputter.increaseIndent();

    packageFolders.forEach(pkg => {
      const packageName = pkg.importPath;

      if (pkg.isExternal) {
        this.outputStylingForExternalNode(outputter);
      }

      this.outputNode(packageName, pkg.description, outputter);

      if (pkg.isExternal) {
        this.outputDefaultNodeStyling(outputter);
      }

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
    const packageId = this.mapNameToId.getId(
      this.getPackageIdKey(packageName, prefix)
    );

    outputter.outputLine(
      `${packageId} [label="${packageName}" xlabel="${description}"]`
    );
  }

  private getPackageIdKey(packageName: string, prefix?: string): string {
    return `${prefix}_${packageName}`;
  }

  private outputEdges(
    config: DocConfig,
    packageFolders: PackageFolder[],
    outputter: IDocOutputter
  ) {
    packageFolders.forEach(pkg => {
      const thisPkgId = this.mapNameToId.getIdOrThrow(
        this.getPackageIdKey(pkg.importPath)
      );

      let allowedPackages = pkg.allowedToImport;
      if (allowedPackages.some(allowed => allowed === "*")) {
        allowedPackages = packageFolders.map(allowed => allowed.importPath);
      }

      allowedPackages.forEach(allowedPkg => {
        // TODO xxx dashed for 3rd party ?
        const allowedPkgId = this.mapNameToId.getIdOrThrow(
          this.getPackageIdKey(allowedPkg)
        );
        outputter.outputLine(`${thisPkgId}-> ${allowedPkgId};`);
      });
    });
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

    // TODO xxx add subgraph
    // TODO xxx add a sub folder to contact-area, for testing
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
