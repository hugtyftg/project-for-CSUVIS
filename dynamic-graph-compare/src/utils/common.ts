import { ID, LinkDatum, NodeDatum } from '../types';

export const idFromEdge = (
  node: ID | NodeDatum,
  id: typeof defaultId = defaultId
): ID => {
  if (typeof node === 'object') {
    return id(node);
  } else {
    return node;
  }
};

export function defaultId(node: NodeDatum) {
  if (node.id) {
    return node.id;
  } else {
    throw new Error('id is not provided and node.id is undefined!!');
  }
}

export function __adjacent_matrix(
  links: LinkDatum[],
  id: typeof defaultId = defaultId
) {
  let adjacentMatrix: Record<ID, Record<ID, number>> = {};
  links.forEach((link) => {
    let src = idFromEdge(link.source);
    let tgt = idFromEdge(link.target);

    if (!adjacentMatrix[src]) {
      adjacentMatrix[src] = {};
    }
    if (!adjacentMatrix[tgt]) {
      adjacentMatrix[tgt] = {};
    }

    adjacentMatrix[src][tgt] = 1;
    adjacentMatrix[tgt][src] = 1;
  });
  return adjacentMatrix;
}

export function __degree(adjacentMatrix: Record<ID, Record<ID, number>>) {
  let degree: Record<ID, number> = {};
  Object.keys(adjacentMatrix).forEach((key) => {
    degree[key] = Object.keys(adjacentMatrix[key]).length;
  });
  return degree;
}

export function dijkstra(
  adjacentMatrix: Record<ID, Record<ID, number>>,
  start: ID
) {
  // 到所有节点的距离
  let distances: Record<ID, number> = {};
  for (let node in adjacentMatrix) {
    distances[node] = Infinity;
  }
  distances[start] = 0;

  let queue: Array<ID> = [];
  queue.push(start);

  while (queue.length > 0) {
    let currentNode = queue.shift();
    if (currentNode !== undefined) {
      let neighbors = adjacentMatrix[currentNode];

      for (let neighbor in neighbors) {
        // 计算从起始节点到该相邻节点的距离
        let distance = distances[currentNode] + neighbors[neighbor];

        // 如果计算出来的距离比已有的距离更短，则更新距离
        if (distance < distances[neighbor]) {
          distances[neighbor] = distance;
          queue.push(neighbor);
        }
      }
    }
  }
  return distances;
}

export function dis(
  node1: Pick<NodeDatum, 'x' | 'y'>,
  node2: Pick<NodeDatum, 'x' | 'y'>
) {
  if (
    node1.x !== undefined &&
    node2.x !== undefined &&
    node1.y !== undefined &&
    node2.y !== undefined
  ) {
    return Math.sqrt(
      Math.pow(node1.x - node2.x, 2) + Math.pow(node1.y - node2.y, 2)
    );
  }
  return 0;
}

export function jiggle() {
  return (Math.random() - 0.5) * 1e-6;
}

export function scaleLinear() {
  return {
    minD: NaN,
    maxD: NaN,
    minR: NaN,
    maxR: NaN,
    k: NaN,
    b: NaN,
    domain([d1, d2]: number[]) {
      this.minD = d1;
      this.maxD = d2;
      return this;
    },
    range([r1, r2]: number[]) {
      this.minR = r1;
      this.maxR = r2;
      return (n: number) => {
        if (
          !Number.isNaN(this.minD) &&
          !Number.isNaN(this.minR) &&
          !Number.isNaN(this.maxD) &&
          !Number.isNaN(this.maxR)
        ) {
          this.k = (this.maxR - this.minR) / (this.maxD - this.minD);
          this.b = this.maxR - this.k * this.maxD;
          return this.k * n + this.b;
        } else {
          return NaN;
        }
      };
    },
  };
}
//计算两点之间的距离
export function distance(u: NodeDatum, v: NodeDatum) {
  return Math.sqrt(Math.pow(u.x! - v.x!, 2) + Math.pow(u.y! - v.y!, 2));
}
