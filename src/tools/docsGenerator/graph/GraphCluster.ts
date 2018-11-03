import { ArrayUtils } from "../utils/ArrayUtils";
import { GraphNode } from "./GraphNode";

export enum ClusterType {
  Root,
  TopLevel,
  AreaWithSubFolders,
  FromOptimization
}

export class GraphCluster extends GraphNode {
  static create(
    numericId: number,
    name: string,
    description: string,
    clusterType: ClusterType
  ) {
    const cluster = new GraphCluster("C" + numericId, name, description);

    cluster.clusterType = clusterType;

    return cluster;
  }

  readonly nodes: GraphNode[] = [];

  clusterType: ClusterType = ClusterType.TopLevel;

  removeNode(node: GraphNode) {
    ArrayUtils.removeFrom(this.nodes, node);
  }
}
