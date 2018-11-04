import { GraphNode } from "../GraphNode";

export class MapIdToGraphNode {
  private mapIdToNode: Map<string, GraphNode> = new Map<string, GraphNode>();

  add(node: GraphNode) {
    const id = node.id;

    if (this.mapIdToNode.has(id)) {
      throw new Error(`already have an entry for id ${id}`);
    }

    this.mapIdToNode.set(id, node);
  }

  getByIdOrThrow(id: string): GraphNode {
    if (!this.mapIdToNode.has(id)) {
      throw new Error(`id ${id} not found in graph map!`);
    }

    return this.mapIdToNode.get(id)!;
  }
}
