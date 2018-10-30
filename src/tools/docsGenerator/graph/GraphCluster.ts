import { ArrayUtils } from "../utils/ArrayUtils";
import { GraphNode } from "./GraphNode";

export class GraphCluster extends GraphNode {
  static create(numericId: number, name: string) {
    return new GraphCluster("C" + numericId, name);
  }

  readonly nodes: GraphNode[] = [];

  // This cluster was generated at optimization, so can be rendered within relevant containing cluster:
  isFromOptimization: boolean = false;

  removeNode(node: GraphNode) {
    ArrayUtils.removeFrom(this.nodes, node);
  }
}
