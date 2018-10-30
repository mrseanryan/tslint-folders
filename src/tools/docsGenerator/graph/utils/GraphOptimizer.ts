import { stringify } from "querystring";

import { Edge } from "../Edge";
import { GraphCluster } from "../GraphCluster";
import { GraphNode } from "../GraphNode";
import { GraphVisitor } from "./GraphVisitor";

/**
 * Optimize the given graph, to reduce the number of edges so that it is more readable.
 *
 * Algorithm:
 *
 * [done] 1. all nodes with same set of incoming edges -> place in an 'optimization' cluster, and replace those edges with 1 edge to the cluster
 * 1b. edges with same origin, and destinations are all in same *optimization* cluster -> replace with 1 edge to that cluster
 * 1c. edges with same destination, and origins are all in same *optimization* cluster -> replace with 1 edge from that cluster
 * 2. all remaining nodes with multiple incoming edges -> inject a 'way point' node to help layout
 * (future) could detect nodes with *mostly* same incoming edges -> place in cluster, and replace *some* edges
 * (alt option) nodes in same cluster as 'records' (just a rendering option?)
 */
export class GraphOptimizer {
  optimize(root: GraphCluster): GraphCluster {
    this.optimizeNodesWithSameIncomings(root);

    // TODO xxx optimization 1b
    // TODO xxx optimization 1c

    this.optimizeNodesWithMultipleIncomings(root);

    return root;
  }

  private optimizeNodesWithSameIncomings(root: GraphCluster) {
    // 1. all nodes with same set of incoming edges -> place in cluster, and replace those edges with 1 edge to the cluster

    const visitor = new GraphVisitor(root);

    const mapNodeIdToOrigins = new Map<string, string[]>();
    const mapNodeIdToNode = new Map<string, GraphNode>();

    const visit = (node: GraphNode) => {
      mapNodeIdToNode.set(node.id, node);

      node.incomingEdges.forEach(edge => {
        if (!mapNodeIdToOrigins.get(node.id)) {
          mapNodeIdToOrigins.set(node.id, []);
        }

        const list = mapNodeIdToOrigins.get(node.id)!;
        list.push(edge.origin.id);
      });
    };

    visitor.visitNodes(visit);

    // build map from 'same origin IDs' to nodes
    const mapOriginIdSetToNodeIds = new Map<string, string[]>();
    mapNodeIdToOrigins.forEach((value, nodeId) => {
      const originIds = value.join(",");

      if (!mapOriginIdSetToNodeIds.get(originIds)) {
        mapOriginIdSetToNodeIds.set(originIds, []);
      }

      mapOriginIdSetToNodeIds.get(originIds)!.push(nodeId);
    });

    let containerId = 1;

    mapOriginIdSetToNodeIds.forEach((value, originIds) => {
      const nodeIds = mapOriginIdSetToNodeIds.get(originIds)!;

      if (nodeIds.length > 1) {
        // We have a set of nodes that can be clustered

        // TODO what about clustering within an existing cluster? (sub folders)
        const topLevelNodeIds = nodeIds.filter(node =>
          root.nodes.find(n => n.id === node)
        );
        const nodes = topLevelNodeIds.map(id => {
          const node = mapNodeIdToNode.get(id);

          if (!node) {
            throw new Error(`cannot find node from map for id ${id}`);
          }

          return node;
        });

        // remove the nodes from the root:
        nodes.forEach(node => root.removeNode(node));

        // remove the old edges, and build list of origin nodes:
        const originNodes: GraphNode[] = [];
        nodes.forEach(node => {
          node.incomingEdges.forEach(edge => {
            edge.origin.removeOutgoingEdge(edge);
            edge.destination.removeIncomingEdge(edge);

            originNodes.push(edge.origin as GraphNode);
          });
        });

        // Add the new cluster:
        const clusterId = `CO1_${containerId++}`;
        const newCluser = new GraphCluster(clusterId, "", "");
        newCluser.isFromOptimization = true;
        newCluser.nodes.push(...nodes);

        root.nodes.push(newCluser);

        // add the new edges:
        originNodes.forEach(origin => {
          Edge.create(origin, newCluser);
        });
      }
    });
  }

  private optimizeNodesWithMultipleIncomings(root: GraphCluster) {
    // 2. all remaining nodes with multiple incoming edges -> inject a 'way point' node to help layout
    // TODO xxx implement optimization 2
  }
}
