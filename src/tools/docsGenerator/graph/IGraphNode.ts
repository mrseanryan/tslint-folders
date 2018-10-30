import { IEdge } from "./IEdge";

export interface IGraphNode {
  id: string;

  readonly incomingEdges: IEdge[];
  readonly outgoingEdges: IEdge[];

  removeIncomingEdge(edge: IEdge): void;
  removeOutgoingEdge(edge: IEdge): void;
}
