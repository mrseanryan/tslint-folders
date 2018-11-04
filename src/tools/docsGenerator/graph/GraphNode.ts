import { ArrayUtils } from "../utils/ArrayUtils";
import { Edge } from "./Edge";
import { IEdge } from "./IEdge";
import { IGraphCluster } from "./IGraphCluster";
import { IGraphNode } from "./IGraphNode";

export enum NodeType {
  Normal,
  External,
  // The 'any' (*) package or folder:
  Any
}

export class GraphNode implements IGraphNode {
  readonly incomingEdges: Edge[] = [];
  readonly outgoingEdges: Edge[] = [];

  constructor(
    public parent: IGraphCluster | null,
    readonly id: string,
    readonly name: string,
    readonly description: string = "",
    readonly nodeType: NodeType = NodeType.Normal
  ) {}

  removeIncomingEdge(edge: IEdge) {
    ArrayUtils.removeFrom(this.incomingEdges, edge);
  }

  removeOutgoingEdge(edge: IEdge) {
    ArrayUtils.removeFrom(this.outgoingEdges, edge);
  }
}
