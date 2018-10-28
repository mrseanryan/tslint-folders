import {
    ImportsBetweenPackagesRuleConfig, PackageFolder, PackageSubFolder
} from "../../../../model/ImportsBetweenPackagesRuleConfig";
import { DocConfig } from "../../Config";
import { IDocGenerator } from "../../interfaces/IDocGenerator";
import { IDocOutputter } from "../../interfaces/IDocOutputter";
import { MapNameToId } from "./MapNameToId";

export class DotDocGenerator implements IDocGenerator {
  private containerId = 1;
  private mapNameToId = new MapNameToId();

  generateDoc(
    config: DocConfig,
    packageConfig: ImportsBetweenPackagesRuleConfig,
    outputter: IDocOutputter
  ): void {
    this.outputSectionSeparator("Header", outputter);
    this.outputHeader(config, outputter);

    this.outputSectionSeparator("Styling", outputter);
    this.outputStyling(config, outputter);

    const packageFolders = packageConfig.checkImportsBetweenPackages.packages;

    this.outputSectionSeparator("Nodes", outputter);
    this.outputPackages(config, packageFolders, outputter);

    this.outputSectionSeparator("Sub-graphs for sub-folders", outputter);
    packageFolders.forEach(pkg =>
      this.outputPackageSubFolders(config, pkg, outputter)
    );

    this.outputSectionSeparator("Edges", outputter);
    this.outputEdges(config, packageFolders, outputter);

    this.outputFooter(outputter);
  }

  private outputHeader(config: DocConfig, outputter: IDocOutputter) {
    outputter.outputLine("digraph packages {");
    outputter.increaseIndent();
    // forcelabels, to ensure xlabels are always placed (even if they overlap)

    outputter.outputLine(`graph [
      label = "${config.dot.title}"
      labelloc = t

      //dpi = 200
      ranksep=0.65
      nodesep=0.40
      rankdir=BT

      style="filled"

      len=0
    ]
  `);
  }

  private outputGraphStyle(outputter: IDocOutputter) {
    outputter.outputLine(`    graph [
        bgcolor="#FFFFFF"
        fillcolor="#FFFFFF"
      ]
    `);
  }

  private outputFooter(outputter: IDocOutputter) {
    outputter.decreaseIndent();
    outputter.outputLine("}");
  }

  // TODO xxx extract to DotStyleGenerator.ts
  private outputStyling(config: DocConfig, outputter: IDocOutputter) {
    // TODO add optional extra styling (more colors) via colorscheme
    outputter.increaseIndent();
    this.outputGraphStyle(outputter);
    this.outputDefaultNodeStyling(config, outputter);
    outputter.decreaseIndent();
  }

  private outputStylingForExternalNode(outputter: IDocOutputter) {
    outputter.outputLine("node [style=dashed];");
  }

  private outputDefaultNodeStyling(
    config: DocConfig,
    outputter: IDocOutputter
  ) {
    // ref: working_copy.dot
    // ref: colors = https://graphviz.gitlab.io/_pages/doc/info/colors.html
    outputter.outputLine(`    node [
      labeljust="l"
      colorscheme="${config.dot.colorScheme}"
      style=filled
      fillcolor=3
      shape=record
  ]

  edge [arrowhead=vee, style=dashed, color="black"]
`);
  }

  private outputSectionSeparator(
    sectionName: string,
    outputter: IDocOutputter
  ) {
    outputter.outputLine(
      `/* ${sectionName} ================================= */`
    );
  }

  private outputPackages(
    config: DocConfig,
    packageFolders: PackageFolder[],
    outputter: IDocOutputter
  ) {
    outputter.increaseIndent();

    this.outputTopLevelSubGraphBegin(config, outputter);

    packageFolders.forEach(pkg => {
      this.outputPackage(config, pkg, outputter);
    });

    this.outputTopLevelSubGraphEnd(outputter);

    outputter.decreaseIndent();
  }

  // TODO xxx why not this.outputter this.config
  private outputTopLevelSubGraphBegin(
    config: DocConfig,
    outputter: IDocOutputter
  ) {
    outputter.outputLine(`    subgraph cluster_topLevel {
      label = "${config.dot.subTitle}"`);

    this.outputPlaceLabelsAtTop(outputter);

    this.outputTopLevelSubGraphStyle(outputter);
  }

  private outputPlaceLabelsAtTop(outputter: IDocOutputter) {
    outputter.outputLine("labelloc = b");
  }

  private outputTopLevelSubGraphEnd(outputter: IDocOutputter) {
    outputter.outputLine("}");
  }

  private outputTopLevelSubGraphStyle(outputter: IDocOutputter) {
    outputter.outputLine(`node [shape="ellipse"]`);
  }

  private outputPackage(
    config: DocConfig,
    pkg: PackageFolder,
    outputter: IDocOutputter
  ) {
    const packageName = pkg.importPath;

    this.outputScopeBegin(outputter);

    if (pkg.isExternal) {
      this.outputStylingForExternalNode(outputter);
    }

    this.outputNode(config, packageName, pkg.description, outputter);

    this.outputScopeEnd(outputter);

    outputter.outputLine("");
  }

  private outputScopeBegin(outputter: IDocOutputter) {
    outputter.outputLine("{");
  }

  private outputScopeEnd(outputter: IDocOutputter) {
    outputter.outputLine("}");
  }

  /**
   * Output the sub-folders of a package as a separate graph cluster.
   *
   * Else, the graph is too hard to read.
   */
  private outputPackageSubFolders(
    config: DocConfig,
    pkg: PackageFolder,
    outputter: IDocOutputter
  ) {
    const isContainer = pkg.subFolders.length > 0 && !config.skipSubFolders;
    if (!isContainer) {
      return;
    }

    this.outputContainerNodeStart(outputter, pkg.importPath, pkg.description);

    this.outputSubFolders(config, outputter, pkg.importPath, pkg.subFolders);

    this.outputContainerNodeEnd(outputter);
  }

  private outputContainerNodeStart(
    outputter: IDocOutputter,
    name: string,
    description: string
  ) {
    outputter.outputLine(`subgraph cluster_${this.containerId} {`);
    outputter.increaseIndent();

    this.outputSubFolderStyle(outputter);

    const formattedDescription =
      description.length > 0 ? ` - ${description}` : "";

    outputter.outputLine(`  label = "${name}${formattedDescription}";`);

    this.containerId++;
  }

  private outputSubFolderStyle(outputter: IDocOutputter) {
    this.outputPlaceLabelsAtTop(outputter);

    outputter.outputLine(`node [shape="folder"]`);
  }

  private outputContainerNodeEnd(outputter: IDocOutputter) {
    // styling at END so is not broken by contained node styling

    outputter.decreaseIndent();

    outputter.outputLine("}");
  }

  private outputNode(
    config: DocConfig,
    packageName: string,
    description: string,
    outputter: IDocOutputter,
    prefix?: string
  ) {
    const packageIdKey = this.getPackageIdKey(packageName, prefix);

    const packageId = this.mapNameToId.getId(packageIdKey);

    const fillColor = this.getColorNumber(config, packageIdKey);

    outputter.outputLine(
      `${packageId} [label="${packageName}\n${description}" fillcolor=${fillColor}]`
    );
  }

  private getColorNumber(config: DocConfig, packageIdKey: string): number {
    let packageNumber = this.mapNameToId.getNumberOrThrow(packageIdKey);

    if (packageNumber > config.dot.maxColors) {
      packageNumber = packageNumber % config.dot.maxColors;
    }

    if (packageNumber === 0) {
      throw new Error("color number must be 1 based - cannot be 0");
    }

    return packageNumber;
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
        allowedPackages = packageFolders
          // disallow import from self
          .filter(allowed => allowed.importPath !== pkg.importPath)
          .map(allowed => allowed.importPath);
      }

      this.outputEdgesForPackageNames(thisPkgId, allowedPackages, outputter);

      // TODO review - kind of duplicate code - could have interface across PackageFolder, PackageSubFolder ?
      if (!config.skipSubFolders) {
        pkg.subFolders.forEach(subFolder => {
          const thisSubFolderId = this.mapNameToId.getId(
            this.getPackageIdKey(subFolder.importPath, pkg.importPath)
          );

          let allowedSubFolders = subFolder.allowedToImport;
          if (allowedSubFolders.some(allowed => allowed === "*")) {
            allowedSubFolders = pkg.subFolders
              .filter(
                // disallow import from self
                otherSubFolder =>
                  otherSubFolder.importPath !== subFolder.importPath
              )
              .map(sub => sub.importPath);
          }

          this.outputEdgesForPackageNames(
            thisSubFolderId,
            allowedSubFolders,
            outputter,
            pkg.importPath
          );
        });
      }
    });
  }

  private outputEdgesForPackageNames(
    thisPkgId: string,
    allowedPackages: string[],
    outputter: IDocOutputter,
    packageIdPrefix?: string
  ) {
    allowedPackages.forEach(allowedPkg => {
      const allowedPkgId = this.mapNameToId.getIdOrThrow(
        this.getPackageIdKey(allowedPkg, packageIdPrefix)
      );
      // TODO xxx remove ;
      // output reversed, to make top level packages appear at top:
      outputter.outputLine(
        `${allowedPkgId}-> ${thisPkgId} [arrowhead="back", dir="back"];`
      );
    });
  }

  private outputSubFolders(
    config: DocConfig,
    outputter: IDocOutputter,
    packageName: string,
    subFolders: PackageSubFolder[]
  ) {
    if (subFolders.length === 0) {
      outputter.outputLine("");
      return;
    }

    // TODO xxx fix indentation in the dot file

    outputter.increaseIndent();

    subFolders.forEach(folder => {
      this.outputNode(
        config,
        folder.importPath,
        folder.description,
        outputter,
        packageName
      );

      outputter.outputLine("");
    });

    outputter.decreaseIndent();
  }
}
