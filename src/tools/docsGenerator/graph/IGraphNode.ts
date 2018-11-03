import { IEdge } from "./IEdge";
import { IGraphCluster } from "./IGraphCluster";

export interface IGraphNode {
  id: string;
  readonly parent: IGraphCluster | null;
  readonly incomingEdges: IEdge[];
  readonly outgoingEdges: IEdge[];

  removeIncomingEdge(edge: IEdge): void;
  removeOutgoingEdge(edge: IEdge): void;
}
