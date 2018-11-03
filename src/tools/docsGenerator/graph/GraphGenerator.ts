import {
    ImportsBetweenPackagesRuleConfig, PackageFolder, PackageSubFolder
} from "../../../model/ImportsBetweenPackagesRuleConfig";
import { DocConfig } from "../Config";
import { MapNameToId } from "../generators/dot/utils/MapNameToId";
import { Edge } from "./Edge";
import { ClusterType, GraphCluster } from "./GraphCluster";
import { GraphNode } from "./GraphNode";
import { MapIdToGraphNode } from "./utils/MapIdToGraphNode";

/**
 * Generate a graph that represents the structure described in the tslint config.
 *
 * The graph can then be optimized before rendering (mainly to reduce the number of edges).
 *
 * note: the graph could contain circular references!
 */
export class GraphGenerator {
  // the root cluster is 0 (root is not output)
  private containerId = 0;
  private mapNameToId = new MapNameToId();
  private mapIdToNode = new MapIdToGraphNode();
  private root: GraphCluster;

  constructor(private config: DocConfig) {
    this.root = GraphCluster.create(
      this.containerId++,
      "root",
      "",
      ClusterType.Root
    );
    this.mapIdToNode.add(this.root);
  }

  generateGraph(packageConfig: ImportsBetweenPackagesRuleConfig): GraphCluster {
    const packageFolders = packageConfig.checkImportsBetweenPackages.packages;

    const topLevelPackage = GraphCluster.create(
      this.containerId++,
      "Top Level Packages",
      "",
      ClusterType.TopLevel
    );
    this.root.nodes.push(topLevelPackage);

    topLevelPackage.nodes.push(
      ...this.generateNodesFromPackages(packageFolders)
    );

    if (!this.config.skipSubFolders) {
      packageFolders.forEach(pkg => {
        this.processPackageSubFolders(pkg);
      });
    }

    this.processEdges(packageFolders);

    return this.root;
  }

  private generateNodesFromPackages(
    packageFolders: PackageFolder[]
  ): GraphNode[] {
    return packageFolders.map(pkg => this.generateNodeFromPackage(pkg));
  }

  private generateNodeFromPackage(pkg: PackageFolder): GraphNode {
    const packageName = pkg.importPath;

    const node = this.generateNode(
      packageName,
      pkg.description,
      pkg.isExternal
    );

    return node;
  }

  /**
   * process the sub-folders of a package as a separate graph cluster.
   *
   * Else, the graph is too hard to read.
   */
  private processPackageSubFolders(pkg: PackageFolder) {
    const isContainer = pkg.subFolders.length > 0;
    if (!isContainer) {
      return;
    }

    const cluster = GraphCluster.create(
      this.containerId++,
      pkg.importPath,
      pkg.description,
      ClusterType.AreaWithSubFolders
    );
    this.mapIdToNode.add(cluster);

    const nodes = this.generateSubFolders(pkg.importPath, pkg.subFolders);

    cluster.nodes.push(...nodes);

    this.root.nodes.push(cluster);
  }

  private generateNode(
    packageName: string,
    description: string,
    isExternal?: boolean,
    prefix?: string
  ): GraphNode {
    const packageIdKey = this.getPackageIdKey(packageName, prefix);

    const packageId = this.mapNameToId.getId(packageIdKey);

    const node = new GraphNode(packageId, packageName, description, isExternal);
    this.mapIdToNode.add(node);

    return node;
  }

  private getPackageIdKey(packageName: string, prefix?: string): string {
    return `${prefix}_${packageName}`;
  }

  private processEdges(packageFolders: PackageFolder[]) {
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

      this.processEdgesForPackageNames(thisPkgId, allowedPackages);

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

          this.processEdgesForPackageNames(
            thisSubFolderId,
            allowedSubFolders,
            pkg.importPath
          );
        });
      }
    });
  }

  private processEdgesForPackageNames(
    thisPkgId: string,
    allowedPackages: string[],
    packageIdPrefix?: string
  ) {
    allowedPackages.forEach(allowedPkg => {
      const allowedPkgId = this.mapNameToId.getIdOrThrow(
        this.getPackageIdKey(allowedPkg, packageIdPrefix)
      );

      const origin = this.mapIdToNode.getByIdOrThrow(thisPkgId);
      const destination = this.mapIdToNode.getByIdOrThrow(allowedPkgId);

      Edge.create(origin, destination);
    });
  }

  private generateSubFolders(
    packageName: string,
    subFolders: PackageSubFolder[]
  ): GraphNode[] {
    if (subFolders.length === 0) {
      return [];
    }

    return subFolders.map(folder =>
      this.generateNode(
        folder.importPath,
        folder.description,
        false,
        packageName
      )
    );
  }
}
