import { ID, LinkDatum, NodeDatum } from '../types';
import {
  __adjacent_matrix,
  defaultId,
  dijkstra,
  dis,
  distance,
} from '../utils/common';

interface GraphState {
  nodes: NodeDatum[];
  links: LinkDatum[];
}

class EvalMetrics {
  private prevState: GraphState | null;
  private readonly state: GraphState;
  private readonly distance: number;
  private shortestPathMatrix: Record<ID, Record<ID, number>> = {};
  private readonly adjacentMatrix: Record<ID, Record<ID, number>>;
  private readonly id;

  constructor(
    state: GraphState,
    distance: number,
    prevState?: GraphState,
    id: (node: NodeDatum) => ID = defaultId
  ) {
    this.state = state;
    this.distance = distance;
    this.prevState = prevState ?? null;
    this.id = id;

    this.adjacentMatrix = __adjacent_matrix(this.state.links, id);
    for (let node in this.adjacentMatrix) {
      this.shortestPathMatrix[node] = dijkstra(this.adjacentMatrix, node);
    }
  }

  energy() {
    let e = 0;
    const { nodes } = this.state;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const sp =
          this.shortestPathMatrix[this.id(nodes[i])][this.id(nodes[j])];
        if (sp) {
          e += Math.pow(dis(nodes[i], nodes[j]) - sp * this.distance, 2);
        }
      }
    }
    return e;
  }

  deltaPos() {
    let delta = 0;
    let prevNodesMap: Record<ID, NodeDatum> = {};
    this.prevState?.nodes?.forEach((node) => {
      prevNodesMap[this.id(node)] = node;
    });
    this.state.nodes.forEach((node) => {
      let prevNode = prevNodesMap[this.id(node)];
      if (prevNode) {
        delta += dis(node, prevNode);
      }
    });
    return delta;
  }

  deltaLen() {
    let delta = 0;
    let prevLinksMap: Record<ID, LinkDatum> = {};
    this.prevState?.links?.forEach((link) => {
      prevLinksMap[link.id] = link;
    });

    this.state.links.forEach((link) => {
      let prevLink = prevLinksMap[link.id];
      if (prevLink) {
        delta += Math.abs(
          dis(link.startPoint, link.endPoint) -
            dis(prevLink.startPoint, prevLink.endPoint)
        );
      }
    });
    return delta;
  }

  deltaDir() {
    let delta = 0;
    let prevNodesMap: Record<ID, NodeDatum> = {};
    this.prevState?.nodes?.forEach((node) => {
      prevNodesMap[this.id(node)] = node;
    });
    this.state.nodes.forEach((nodeI) => {
      this.state.nodes.forEach((nodeJ) => {
        let prevNodeI = prevNodesMap[this.id(nodeI)];
        let prevNodeJ = prevNodesMap[this.id(nodeJ)];
        if (prevNodeI && prevNodeJ) {
          if (nodeI.x && nodeJ.x && prevNodeI.x && prevNodeJ.x) {
            delta += Math.abs(prevNodeI.x - prevNodeJ.x - (nodeI.x - nodeJ.x));
          }
          if (nodeI.y && nodeJ.y && prevNodeI.y && prevNodeJ.y) {
            delta += Math.abs(prevNodeI.y - prevNodeJ.y - (nodeI.y - nodeJ.y));
          }
        }
      });
    });
    return delta / 2;
  }

  deltaOrth() {
    let delta = 0;
    let prevNodesMap: Record<ID, NodeDatum> = {};
    this.prevState?.nodes?.forEach((node) => {
      prevNodesMap[this.id(node)] = node;
    });
    this.state.nodes.forEach((nodeI) => {
      this.state.nodes.forEach((nodeJ) => {
        let prevNodeI = prevNodesMap[this.id(nodeI)];
        let prevNodeJ = prevNodesMap[this.id(nodeJ)];
        if (prevNodeI && prevNodeJ) {
          if (nodeI.x && nodeJ.x && prevNodeI.x && prevNodeJ.x) {
            if ((prevNodeI.x - prevNodeJ.x) * (nodeI.x - nodeJ.x) < 0) {
              delta++;
            }
          }
          if (nodeI.y && nodeJ.y && prevNodeI.y && prevNodeJ.y) {
            if ((prevNodeI.y - prevNodeJ.y) * (nodeI.y - nodeJ.y) < 0) {
              delta++;
            }
          }
        }
      });
    });
    return delta / 2;
  }
  calculateDCQ() {
    //1.计算max(s1)和max(s2)
    let diam1: number = 0,
      diam2: number = 0,
      s1: number = 0,
      s2: number = 0;
    this.prevState?.nodes.forEach((u) => {
      this.prevState?.nodes.forEach((v) => {
        let dis = distance(u, v);
        s1 = Math.max(dis, s1);
      });
    });

    this.state.nodes.forEach((u) => {
      this.state.nodes.forEach((v) => {
        let dis = distance(u, v);
        s2 = Math.max(dis, s2);
      });
    });

    //2.计算两点间的图论距离
    let adjacentMatrix1 = __adjacent_matrix(
      this.prevState?.links as any,
      this.id
    );

    let shortestPathMatrix1: Record<ID, Record<ID, number>> = {};
    for (let node in adjacentMatrix1) {
      shortestPathMatrix1[node] = dijkstra(adjacentMatrix1, node);
      //计算diam(G1)
      for (let v in shortestPathMatrix1[node]) {
        diam1 = Math.max(shortestPathMatrix1[node][v], diam1);
      }
    }

    let adjacentMatrix2 = __adjacent_matrix(this.state.links, this.id);

    let shortestPathMatrix2: Record<ID, Record<ID, number>> = {};
    for (let node in adjacentMatrix2) {
      shortestPathMatrix2[node] = dijkstra(adjacentMatrix2, node);
      //计算diam(G2)
      for (let v in shortestPathMatrix2[node]) {
        diam2 = Math.max(shortestPathMatrix2[node][v], diam2);
      }
    }

    //3.按照公式计算DCQ
    let DCQ: number,
      p: number = 0,
      nodesize: number;
    nodesize = Math.min(
      this.prevState?.nodes.length as any,
      this.state.nodes.length
    );
    for (let i = 0; i < nodesize; i++) {
      for (let j = i + 1; j < nodesize; j++) {
        let u = this.state.nodes[i],
          v = this.state.nodes[j];
        p += Math.abs(
          Math.abs(
            shortestPathMatrix1[this.id(u)][this.id(v)] / diam1 -
              shortestPathMatrix2[this.id(u)][this.id(v)] / diam2
          ) -
            Math.abs(
              distance(
                this.prevState?.nodes[i] as any,
                this.prevState?.nodes[j] as any
              ) /
                s1 -
                distance(this.state.nodes[i], this.state.nodes[j]) / s2
            )
        );
      }
    }
    console.log('this is p:' + p);
    DCQ = 1 - (2 * p) / Math.pow(nodesize, 2);
    console.log('this is dcq:' + DCQ);
    return DCQ;
  }

  all() {
    return {
      energy: this.energy(),
      deltaPos: this.deltaPos(),
      deltaLen: this.deltaLen(),
      deltaDir: this.deltaDir(),
      deltaOrth: this.deltaOrth(),
      DCQ: this.calculateDCQ(),
    };
  }
}

export default EvalMetrics;
