import { ArrayUtils } from "../utils/ArrayUtils";
import { GraphNode } from "./GraphNode";
import { IGraphCluster } from "./IGraphCluster";

export enum ClusterType {
  Root,
  TopLevel,
  AreaWithSubFolders,
  FromOptimization
}

export class GraphCluster extends GraphNode implements IGraphCluster {
  static create(
    parent: GraphCluster | null,
    numericId: number,
    name: string,
    description: string,
    clusterType: ClusterType
  ) {
    const cluster = new GraphCluster(
      parent,
      "C" + numericId,
      name,
      description
    );

    cluster.clusterType = clusterType;

    return cluster;
  }

  readonly nodes: GraphNode[] = [];

  clusterType: ClusterType = ClusterType.TopLevel;

  removeNode(node: GraphNode) {
    ArrayUtils.removeFrom(this.nodes, node);
  }
}
