import { stringify } from "querystring";

import { Edge } from "../Edge";
import { ClusterType, GraphCluster } from "../GraphCluster";
import { GraphNode } from "../GraphNode";
import { GraphVisitor } from "./GraphVisitor";

/**
 * Optimize the given graph, to reduce the number of edges so that it is more readable.
 *
 * Algorithm:
 *
 * [done] 1a. all nodes with same set of incoming edges -> place in an 'optimization' cluster, and replace those edges with 1 edge to the cluster
 * 1b. edges with same origin, and destinations are all in same *optimization* cluster -> replace with 1 edge to that cluster
 * [done] 1c. edges with same destination, and origins are all in same *optimization* cluster -> replace with 1 edge from that cluster
 * (future) could detect nodes with *mostly* same incoming edges -> place in cluster, and replace *some* edges
 * (alt option) nodes in same cluster as 'records' (just a rendering option?)
 */
export class GraphOptimizer {
  private containerId = 1;

  optimize(root: GraphCluster) {
    this.optimizeNodesWithSameIncomings(root);

    // TODO xxx optimization 1b

    this.optimizeEdgesWithOriginsInSameCluster(root);
  }

  private optimizeNodesWithSameIncomings(root: GraphCluster) {
    // 1a. all nodes with same set of incoming edges -> place in cluster, and replace those edges with 1 edge to the cluster

    const { mapNodeIdToNode, mapNodeIdToOrigins } = this.populateMaps(root);

    // build map from 'same origin IDs' to nodes
    const mapOriginIdSetToNodeIds = new Map<string, string[]>();
    mapNodeIdToOrigins.forEach((value, nodeId) => {
      const originIds = value.join(",");

      if (!mapOriginIdSetToNodeIds.get(originIds)) {
        mapOriginIdSetToNodeIds.set(originIds, []);
      }

      mapOriginIdSetToNodeIds.get(originIds)!.push(nodeId);
    });

    mapOriginIdSetToNodeIds.forEach((value, originIds) => {
      const nodeIds = mapOriginIdSetToNodeIds.get(originIds)!;

      if (nodeIds.length > 1) {
        // We have a set of nodes that can be clustered
        root.nodes
          .filter(node => node instanceof GraphCluster)
          .forEach(node => {
            const cluster = node as GraphCluster;
            this.optimizeNodesWithSameIncomingsForCluster(
              cluster,
              nodeIds,
              mapNodeIdToNode
            );
          });
      }
    });
  }

  private populateMaps(root: GraphCluster) {
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

    visitor.visitNodesAndClusters(visit);

    return {
      mapNodeIdToNode,
      mapNodeIdToOrigins
    };
  }

  private optimizeNodesWithSameIncomingsForCluster(
    parent: GraphCluster,
    nodeIds: string[],
    mapNodeIdToNode: Map<string, GraphNode>
  ) {
    const matchingNodeIdsInParent = nodeIds.filter(node =>
      parent.nodes.find(n => n.id === node)
    );

    const nodes = matchingNodeIdsInParent.map(id => {
      const node = mapNodeIdToNode.get(id);

      if (!node) {
        throw new Error(`cannot find node from map for id ${id}`);
      }

      return node;
    });

    // remove the nodes from the parent:
    nodes.forEach(node => parent.removeNode(node));

    // remove the old edges, and build list of origin nodes:
    const originNodes: GraphNode[] = [];
    nodes.forEach(node => {
      // copy list of edges, since we are deleting from it:
      const incomingEdges = [...node.incomingEdges];

      incomingEdges.forEach(edge => {
        edge.remove();

        originNodes.push(edge.origin as GraphNode);
      });
    });

    // Add the new cluster:
    const clusterId = `CO1_${this.containerId++}`;
    const newCluser = new GraphCluster(parent, clusterId, "");
    newCluser.clusterType = ClusterType.FromOptimization;
    newCluser.nodes.push(...nodes);
    nodes.forEach(node => (node.parent = newCluser));

    parent.nodes.push(newCluser);

    // add the new edges:
    originNodes.forEach(origin => {
      Edge.create(origin, newCluser);
    });
  }

  private optimizeEdgesWithOriginsInSameCluster(root: GraphCluster) {
    // 1c. edges with same destination, and origins are all in same *optimization* cluster -> replace with 1 edge from that cluster
    // For a node, find all the edges where the origin is in the same cluster

    const { mapNodeIdToNode } = this.populateMaps(root);

    mapNodeIdToNode.forEach(node => {
      if (node.incomingEdges.length < 2 || !node.parent) {
        return;
      }

      const mapEdgesByIncomingClusterId = new Map<string, Edge[]>();
      node.incomingEdges.forEach(edge => {
        if (!edge.origin.parent) {
          return;
        }

        if (node.parent!.id === edge.origin.parent.id) {
          // node and edge origin are in same cluster
          return;
        }

        const incomingClusterId = edge.origin.parent.id;
        if (!mapEdgesByIncomingClusterId.has(incomingClusterId)) {
          mapEdgesByIncomingClusterId.set(incomingClusterId, []);
        }

        mapEdgesByIncomingClusterId.get(incomingClusterId)!.push(edge);
      });

      // For cluster IDs that have multiple edges, replace those edges with 1:
      mapEdgesByIncomingClusterId.forEach((edges, clusterId) => {
        if (edges.length < 2) {
          return;
        }

        const incomingCluster = mapNodeIdToNode.get(clusterId);
        if (!incomingCluster) {
          throw new Error(`cannot find cluster id ${clusterId}`);
        }
        if (!(incomingCluster instanceof GraphCluster)) {
          throw new Error(
            `incoming cluster is not a cluster! - id ${clusterId}`
          );
        }

        // only create an edge from that cluster, if ALL the nodes in the cluster have outgoing to this node:
        const allClusterNodesHaveOutgoingsToThisNode = incomingCluster.nodes.every(
          n => n.outgoingEdges.some(e => e.destination.id === node.id)
        );
        if (!allClusterNodesHaveOutgoingsToThisNode) {
          return;
        }

        // remove the edges
        edges.forEach(edge => edge.remove());

        // add 1 edge from the cluster, to the node
        Edge.create(incomingCluster, node);
      });
    });
  }
}
