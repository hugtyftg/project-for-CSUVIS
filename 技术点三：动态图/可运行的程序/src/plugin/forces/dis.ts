import { Force } from 'd3-force';
import { LinkDatum, NodeDatum } from '../types';
import { dis } from '../compareAlg/common';

function forceDis(x?: number, y?: number): Force<NodeDatum, LinkDatum> {
  let nodes: NodeDatum[];

  if (!x) x = 0;
  if (!y) y = 0;

  function force(alpha: number) {
    nodes.forEach((node) => {
      let prevNode = node.prev;
      if (
        prevNode &&
        prevNode.x !== undefined &&
        node.x !== undefined &&
        prevNode.y !== undefined &&
        node.y !== undefined &&
        node.vx &&
        node.vy
      ) {
        let diff = Math.abs(dis({ x, y }, node) - dis({ x, y }, prevNode));
        let d = dis(prevNode, node);
        let deltaVx = ((prevNode.x - node.x) / d) * diff * alpha;
        let deltaVy = ((prevNode.y - node.y) / d) * diff * alpha;
        node.vx += deltaVx;
        node.vy += deltaVy;
      }
    });
  }

  force.initialize = function (_: NodeDatum[]) {
    nodes = _;
  };

  return force;
}

export default forceDis;
