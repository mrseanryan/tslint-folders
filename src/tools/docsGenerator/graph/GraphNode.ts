import { Edge } from "./Edge";
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
}
