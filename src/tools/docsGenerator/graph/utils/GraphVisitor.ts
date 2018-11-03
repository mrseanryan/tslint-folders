import { Edge } from "../Edge";
import { GraphCluster } from "../GraphCluster";
import { GraphNode } from "../GraphNode";
import { VisitedIdTracker } from "./VisitedIdTracker";

export class GraphVisitor {
  private visited = new VisitedIdTracker();

  constructor(private root: GraphCluster) {}

  visitEdges(visit: (edge: Edge) => void) {
    const allEdges: Edge[] = [];

    const visitedEdges = new VisitedIdTracker();

    const addNodeEdges = (node: GraphNode) => {
      node.incomingEdges.forEach(edge => {
        if (!visitedEdges.isVisitedOrAdd(edge.id)) {
          allEdges.push(edge);
        }
      });

      node.outgoingEdges.forEach(edge => {
        if (!visitedEdges.isVisitedOrAdd(edge.id)) {
          allEdges.push(edge);
        }
      });
    };

    this.visitNodesAndClusters(addNodeEdges);

    allEdges.map(visit);
  }

  visitNodesAndClusters(visit: (node: GraphNode) => void) {
    const visitNode = (node: GraphNode) => {
      if (this.visited.isVisitedOrAdd(node.id)) {
        return;
      }

      visit(node);

      if (node instanceof GraphCluster) {
        node.nodes.map(visitNode);
      }
    };

    visitNode(this.root);
  }
}
