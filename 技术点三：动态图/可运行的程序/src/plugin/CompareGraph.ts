import markovMobility from './compareAlg/markovMobility';
import ageMobility from './compareAlg/ageMobility';
import pinningWeightMobility from './compareAlg/pinningWeightMobility';
import degreeMobility from './compareAlg/degreeModility';
import { LinkDatum, NodeDatum, GroupData } from './types';
import initNodePos from './initNodePos';
type Alg = 'age' | 'pinning' | 'degree' | 'markov';
const AlgMap = new Map([
  ['alg', ageMobility],
  ['pinning', pinningWeightMobility],
  ['degree', degreeMobility],
  ['markov', markovMobility],
]);
class CompareGraph {
  algorithm: any;
  // 旧数据
  oldEdges: LinkDatum[] = [];
  oldNodes: NodeDatum[] = [];
  // 当前数据
  nodes: NodeDatum[] = [];
  edges: LinkDatum[] = [];

  // key
  key: string = 'name';
  constructor(algName: Alg, readonly data: GroupData) {
    this.algorithm = AlgMap.get(algName);
  }
  getTimeSlice(time: number) {
    // 从所有数据中截取出当前时间片的点边
    this.nodes = this.data.nodes
      .filter((node) => {
        return (node.start ?? -1) <= time && (node.end ?? Infinity) >= time;
      })
      .map((node) => ({
        ...node,
        // key是name
        id: node.name,
      })) as unknown as NodeDatum[];
    this.edges = this.data.links
      .filter((link) => {
        return (link.start ?? -1) <= time && (link.end ?? Infinity) >= time;
      })
      .map((link) => ({
        ...link,
        id: link.id.toString(),
        source: link.source.toString(),
        target: link.target.toString(),
      })) as unknown as LinkDatum[];
    // 初始处理节点坐标
    initNodePos(this.oldNodes, this.oldEdges, this.nodes, this.edges);
    // 根据年龄计算下个时间片坐标
    // ???算法貌似没有生效啊
    // this.algorithm(this.oldNodes, this.oldEdges, this.nodes, this.edges);

    // 时间片向后推移
    this.oldEdges = this.edges;
    this.oldNodes = this.nodes;
    time++;

    return {
      nodes: this.nodes,
      edges: this.edges,
    };
  }
}

export { CompareGraph };
