import { GraphNode } from "./GraphNode";

export class GraphCluster extends GraphNode {
  static create(numericId: number, name: string) {
    return new GraphCluster("C" + numericId, name);
  }

  readonly nodes: GraphNode[] = [];
}
