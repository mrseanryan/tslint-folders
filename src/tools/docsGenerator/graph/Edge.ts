import { IGraphNode } from "./IGraphNode";

export class Edge {
  constructor(readonly origin: IGraphNode, readonly destination: IGraphNode) {}

  get id(): string {
    return `${this.origin.id}->${this.destination.id}`;
  }
}
