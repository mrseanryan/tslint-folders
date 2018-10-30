import { ArrayUtils } from "../utils/ArrayUtils";
import { Edge } from "./Edge";
import { IEdge } from "./IEdge";
import { IGraphNode } from "./IGraphNode";

export class GraphNode implements IGraphNode {
  readonly incomingEdges: Edge[] = [];
  readonly outgoingEdges: Edge[] = [];

  constructor(
    readonly id: string,
    readonly name: string,
    readonly description: string = "",
    readonly isExternal: boolean = false
  ) {}

  removeIncomingEdge(edge: IEdge) {
    ArrayUtils.removeFrom(this.incomingEdges, edge);
  }

  removeOutgoingEdge(edge: IEdge) {
    ArrayUtils.removeFrom(this.outgoingEdges, edge);
  }
}
