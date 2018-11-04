import { groupBy } from "lodash";

import {
    ImportsBetweenPackagesRuleConfig, PackageFolder, PackageSubFolder
} from "../../../model/ImportsBetweenPackagesRuleConfig";
import { DocConfig } from "../Config";
import { MapNameToId } from "../generators/dot/utils/MapNameToId";
import { BlacklistFilter } from "../utils/BlacklistFilter";
import { Edge } from "./Edge";
import { ClusterType, GraphCluster } from "./GraphCluster";
import { GraphNode, NodeType } from "./GraphNode";
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

  constructor(private config: DocConfig, private filter: BlacklistFilter) {
    this.root = GraphCluster.create(
      null,
      this.containerId++,
      "root",
      "",
      ClusterType.Root
    );
    this.mapIdToNode.add(this.root);
  }

  generateGraph(packageConfig: ImportsBetweenPackagesRuleConfig): GraphCluster {
    const packageFolders = packageConfig.checkImportsBetweenPackages.packages.filter(
      pkg => this.filter.isImportPathOk(pkg.importPath)
    );

    this.checkIfNeedsAnyPackage(packageFolders);

    const topLevelCluster = GraphCluster.create(
      this.root,
      this.containerId++,
      "Top Level Packages",
      "",
      ClusterType.TopLevel
    );
    this.root.nodes.push(topLevelCluster);

    topLevelCluster.nodes.push(
      ...this.generateNodesFromPackages(topLevelCluster, packageFolders)
    );

    if (!this.config.skipSubFolders) {
      packageFolders.forEach(pkg => {
        this.processPackageSubFolders(this.root, pkg);
      });
    }

    this.processEdges(packageFolders);

    return this.root;
  }

  private checkIfNeedsAnyPackage(packageFolders: PackageFolder[]) {
    if (!this.config.dot.showImportAnyAsNodeNotEdges) {
      return;
    }

    if (
      packageFolders.some(pkg =>
        pkg.allowedToImport.some(allowed => allowed === "*")
      )
    ) {
      packageFolders.push(this.createAnyPackage());
    }

    // also for sub-folders:
    packageFolders.forEach(pkg => {
      if (
        pkg.subFolders.some(sub =>
          sub.allowedToImport.some(allowed => allowed === "*")
        )
      ) {
        pkg.subFolders.push(this.createAnySubPackage());
      }
    });
  }

  private generateNodesFromPackages(
    cluster: GraphCluster,
    packageFolders: PackageFolder[]
  ): GraphNode[] {
    if (!this.config.dot.clusterFromTslintJson) {
      return packageFolders.map(pkg =>
        this.generateNodeFromPackage(cluster, pkg)
      );
    }

    const defaultCluster = "(defaultCluster)";
    const packagesByCluster = groupBy(
      packageFolders,
      (pkg: PackageFolder) => pkg.diagramCluster || defaultCluster
    );

    const nodes: GraphNode[] = [];

    Object.keys(packagesByCluster).forEach(key => {
      const pkgs = packagesByCluster[key];

      const nodesThisCluster = pkgs.map(pkg =>
        this.generateNodeFromPackage(cluster, pkg)
      );

      if (key === defaultCluster) {
        nodes.push(...nodesThisCluster);
      }
      if (key !== defaultCluster) {
        const subCluster = GraphCluster.create(
          cluster,
          this.containerId++,
          "",
          "",
          ClusterType.DiagramCluster
        );
        this.mapIdToNode.add(cluster);

        nodes.push(subCluster);

        subCluster.nodes.push(...nodesThisCluster);

        nodesThisCluster.forEach(n => (n.parent = subCluster));
      }
    });

    return nodes;
  }

  private generateNodeFromPackage(
    cluster: GraphCluster,
    pkg: PackageFolder
  ): GraphNode {
    const packageName = pkg.importPath;

    const node = this.generateNode(
      cluster,
      packageName,
      pkg.description,
      this.getNodeType(pkg)
    );

    return node;
  }

  private getNodeType(pkg: PackageFolder): NodeType {
    if (pkg.isExternal) {
      return NodeType.External;
    }

    if (pkg.importPath === this.getAnyPackageId()) {
      return NodeType.Any;
    }

    return NodeType.Normal;
  }

  private getNodeTypeForSubFolder(pkg: PackageSubFolder): NodeType {
    if (pkg.importPath === this.getAnyPackageId()) {
      return NodeType.Any;
    }

    return NodeType.Normal;
  }

  /**
   * process the sub-folders of a package as a separate graph cluster.
   *
   * Else, the graph is too hard to read.
   */
  private processPackageSubFolders(parent: GraphCluster, pkg: PackageFolder) {
    const isContainer = pkg.subFolders.length > 0;
    if (!isContainer) {
      return;
    }

    const cluster = GraphCluster.create(
      parent,
      this.containerId++,
      pkg.importPath,
      pkg.description,
      ClusterType.AreaWithSubFolders
    );
    this.mapIdToNode.add(cluster);

    const nodes = this.generateSubFolders(
      cluster,
      pkg.importPath,
      pkg.subFolders.filter(sub => this.filter.isImportPathOk(sub.importPath))
    );

    cluster.nodes.push(...nodes);

    this.root.nodes.push(cluster);
  }

  private generateNode(
    cluster: GraphCluster,
    packageName: string,
    description: string,
    nodeType: NodeType = NodeType.Normal,
    prefix?: string
  ): GraphNode {
    const packageIdKey = this.getPackageIdKey(packageName, prefix);

    const packageId = this.mapNameToId.getId(packageIdKey);

    const node = new GraphNode(
      cluster,
      packageId,
      packageName,
      description,
      nodeType
    );
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
        if (this.config.dot.showImportAnyAsNodeNotEdges) {
          allowedPackages = [this.getAnyPackageId()];
        } else {
          allowedPackages = packageFolders
            // disallow import from self
            .filter(allowed => allowed.importPath !== pkg.importPath)
            .map(allowed => allowed.importPath);
        }
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
            if (this.config.dot.showImportAnyAsNodeNotEdges) {
              allowedSubFolders = [this.getAnyPackageId()];
            } else {
              allowedSubFolders = pkg.subFolders
                .filter(
                  // disallow import from self
                  otherSubFolder =>
                    otherSubFolder.importPath !== subFolder.importPath
                )
                .map(sub => sub.importPath);
            }
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

  private getAnyPackageId(): string {
    return "*";
  }

  private createAnyPackage(): PackageFolder {
    return {
      allowedToImport: [],
      description: "(can import any packages)",
      importPath: this.getAnyPackageId(),
      isExternal: false,
      subFolders: []
    };
  }

  private createAnySubPackage(): PackageSubFolder {
    return {
      allowedToImport: [],
      description: "(can import any folders)",
      importPath: this.getAnyPackageId()
    };
  }

  private processEdgesForPackageNames(
    thisPkgId: string,
    allowedPackages: string[],
    packageIdPrefix?: string
  ) {
    allowedPackages
      .filter(pkg => this.filter.isImportPathOk(pkg))
      .forEach(allowedPkg => {
        const allowedPkgId = this.mapNameToId.getIdOrThrow(
          this.getPackageIdKey(allowedPkg, packageIdPrefix)
        );

        const origin = this.mapIdToNode.getByIdOrThrow(thisPkgId);
        const destination = this.mapIdToNode.getByIdOrThrow(allowedPkgId);

        Edge.create(origin, destination);
      });
  }

  private generateSubFolders(
    cluster: GraphCluster,
    packageName: string,
    subFolders: PackageSubFolder[]
  ): GraphNode[] {
    if (subFolders.length === 0) {
      return [];
    }

    return subFolders.map(folder =>
      this.generateNode(
        cluster,
        folder.importPath,
        folder.description,
        this.getNodeTypeForSubFolder(folder),
        packageName
      )
    );
  }
}
