import {
    ImportsBetweenPackagesRuleConfig, PackageFolder, PackageSubFolder
} from "../../../../model/ImportsBetweenPackagesRuleConfig";
import { DocConfig } from "../../Config";
import { IDocGenerator } from "../../interfaces/IDocGenerator";
import { IDocOutputter } from "../../interfaces/IDocOutputter";
import { DateHelper } from "../../utils/DateHelper";
import { DocGeneratorBase } from "../shared/DocGeneratorBase";
import { DotStyleGenerator } from "./utils/DotStyleGenerator";
import { MapNameToId } from "./utils/MapNameToId";

export class DotDocGenerator extends DocGeneratorBase implements IDocGenerator {
  private containerId = 1;
  private mapNameToId = new MapNameToId();
  private styler: DotStyleGenerator;

  constructor(protected config: DocConfig, protected outputter: IDocOutputter) {
    super(config, outputter);

    this.styler = new DotStyleGenerator(config, outputter);
  }

  generateDoc(packageConfig: ImportsBetweenPackagesRuleConfig): void {
    this.outputSectionSeparator("Header");
    this.outputHeader();
    this.outputter.outputLine(``);

    this.outputSectionSeparator("Styling");
    this.styler.outputStyling();
    this.outputter.outputLine(``);

    const packageFolders = packageConfig.checkImportsBetweenPackages.packages;

    this.outputSectionSeparator("Nodes");
    this.outputPackages(packageFolders);
    this.outputter.outputLine(``);

    if (!this.config.skipSubFolders) {
      this.outputSectionSeparator("Sub-graphs for sub-folders");
      packageFolders.forEach(pkg => {
        this.outputPackageSubFolders(pkg);
      });
    } else {
      this.outputter.outputLine(``);
    }

    this.outputSectionSeparator("Edges");
    this.outputEdges(packageFolders);
    this.outputter.outputLine(``);

    this.outputFooter();
  }

  private outputHeader() {
    this.outputter.outputLine(
      `/* auto-generated by tslint-folders docs tool at ${DateHelper.nowHumanReadable()}*/`
    );

    this.outputter.outputLine("digraph packages {");
    this.outputter.increaseIndent();

    this.outputGraphSettings();
  }

  private outputGraphSettings() {
    this.outputSectionSeparator("Graph settings");
    this.outputter.outputLine(`graph [`);
    this.outputter.increaseIndent();

    this.outputter.outputLines([
      `label = "${this.config.dot.title}"`,
      `labelloc = t`,
      ``,
      `//dpi = 200`,
      `ranksep=0.65`,
      `nodesep=0.40`,
      `rankdir=BT`,
      ``,
      `style="filled"`,
      ``,
      `len=0`
    ]);

    this.outputter.decreaseIndent();
    this.outputter.outputLine(`]`);
  }

  private outputFooter() {
    this.outputter.decreaseIndent();
    this.outputter.outputLine("}");
  }

  private outputSectionSeparator(sectionName: string) {
    this.outputter.outputLine(
      `/* ${sectionName} ================================= */`
    );
  }

  private outputPackages(packageFolders: PackageFolder[]) {
    this.outputTopLevelSubGraphBegin();

    packageFolders.forEach(pkg => {
      this.outputPackage(pkg);
    });

    this.outputTopLevelSubGraphEnd();
  }

  private outputTopLevelSubGraphBegin() {
    this.outputter.outputLine(`subgraph cluster_topLevel {`);
    this.outputter.increaseIndent();

    this.outputter.outputLine(`label = "${this.config.dot.subTitle}"`);

    this.styler.outputPlaceLabelsAtTop();

    this.styler.outputTopLevelSubGraphStyle();
  }

  private outputTopLevelSubGraphEnd() {
    this.outputter.decreaseIndent();
    this.outputter.outputLine("}");
  }

  private outputPackage(pkg: PackageFolder) {
    const packageName = pkg.importPath;

    this.outputScopeBegin();

    if (pkg.isExternal) {
      this.styler.outputStylingForExternalNode();
    }

    this.outputNode(packageName, pkg.description);

    this.outputScopeEnd();

    this.outputter.outputLine("");
  }

  private outputScopeBegin() {
    this.outputter.outputLine("{");
  }

  private outputScopeEnd() {
    this.outputter.outputLine("}");
  }

  /**
   * Output the sub-folders of a package as a separate graph cluster.
   *
   * Else, the graph is too hard to read.
   */
  private outputPackageSubFolders(pkg: PackageFolder) {
    const isContainer = pkg.subFolders.length > 0;
    if (!isContainer) {
      return;
    }

    this.outputContainerNodeStart(pkg.importPath, pkg.description);

    this.outputSubFolders(pkg.importPath, pkg.subFolders);

    this.outputContainerNodeEnd();
    this.outputter.outputLine(``);
  }

  private outputContainerNodeStart(name: string, description: string) {
    this.outputter.outputLine(`subgraph cluster_${this.containerId} {`);
    this.outputter.increaseIndent();

    this.styler.outputSubFolderStyle();

    const formattedDescription =
      description.length > 0 ? ` - ${description}` : "";

    this.outputter.outputLine(`label = "${name}${formattedDescription}"`);

    this.containerId++;
  }

  private outputContainerNodeEnd() {
    // styling at END so is not broken by contained node styling

    this.outputter.decreaseIndent();

    this.outputter.outputLine("}");
  }

  private outputNode(
    packageName: string,
    description: string,
    prefix?: string
  ) {
    const packageIdKey = this.getPackageIdKey(packageName, prefix);

    const packageId = this.mapNameToId.getId(packageIdKey);

    const fillColor = this.getColorNumber(packageIdKey);

    this.outputter.outputLine(
      `${packageId} [label="${packageName}\n${description}" fillcolor=${fillColor}]`
    );
  }

  private getColorNumber(packageIdKey: string): number {
    let packageNumber = this.mapNameToId.getNumberOrThrow(packageIdKey);

    if (packageNumber > this.config.dot.maxColors) {
      packageNumber = packageNumber % this.config.dot.maxColors;
    }

    if (packageNumber === 0) {
      // for a graphviz color scheme, the color number must be 1 based:
      packageNumber = 1;
    }

    return packageNumber;
  }

  private getPackageIdKey(packageName: string, prefix?: string): string {
    return `${prefix}_${packageName}`;
  }

  private outputEdges(packageFolders: PackageFolder[]) {
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

      this.outputEdgesForPackageNames(thisPkgId, allowedPackages);

      // TODO review - kind of duplicate code - could have interface across PackageFolder, PackageSubFolder ?
      if (!this.config.skipSubFolders) {
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
            pkg.importPath
          );
        });
      }
    });
  }

  private outputEdgesForPackageNames(
    thisPkgId: string,
    allowedPackages: string[],
    packageIdPrefix?: string
  ) {
    allowedPackages.forEach(allowedPkg => {
      const allowedPkgId = this.mapNameToId.getIdOrThrow(
        this.getPackageIdKey(allowedPkg, packageIdPrefix)
      );
      // output reversed, to make top level packages appear at top:
      this.outputter.outputLine(
        `${allowedPkgId}-> ${thisPkgId} [dir="back"]`
      );
    });
  }

  private outputSubFolders(
    packageName: string,
    subFolders: PackageSubFolder[]
  ) {
    if (subFolders.length === 0) {
      this.outputter.outputLine("");
      return;
    }

    subFolders.forEach(folder => {
      this.outputNode(folder.importPath, folder.description, packageName);

      this.outputter.outputLine("");
    });
  }
}
