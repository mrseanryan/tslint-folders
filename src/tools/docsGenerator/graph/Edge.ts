import { IEdge } from "./IEdge";
import { IGraphNode } from "./IGraphNode";

export class Edge implements IEdge {
  static create(origin: IGraphNode, destination: IGraphNode) {
    const edge = new Edge(origin, destination);

    origin.outgoingEdges.push(edge);
    destination.incomingEdges.push(edge);
  }

  constructor(readonly origin: IGraphNode, readonly destination: IGraphNode) {}

  get id(): string {
    return `${this.origin.id}->${this.destination.id}`;
  }

  remove() {
    this.origin.removeOutgoingEdge(this);
    this.destination.removeIncomingEdge(this);
  }
}
