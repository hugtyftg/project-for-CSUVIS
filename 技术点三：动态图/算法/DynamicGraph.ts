import { GraphInfo, LinkInfo, NodeInfo } from './types';
import calcGraphWithWorker from '../worker';

class DynamicGraph {
  data: any;
  nodes: NodeInfo[] = [];
  links: LinkInfo[] = [];
  pieces: number = 0;
  graphInfo: GraphInfo[] = [];
  idMap: Map<string, number> = new Map();

  constructor(data: any) {
    setTimeout(() => {
      this.data = data;
      this.initGraph();
      this.initNodePosition();
      this.prepareNextSlice(0);
    }, 100);
  }

  // 初始化图信息，包括节点集合和连边集合
  private initGraph(): void {
    // 最大、最小时间片数，保证从0时间片开始。
    let maxPiece: number = this.data.nodes[0].start;
    let minPiece: number = maxPiece;

    this.data.nodes.forEach((item: any) => {
      minPiece = minPiece < item.start ? minPiece : item.start;
      maxPiece = maxPiece > item.end ? maxPiece : item.end;
    });

    // 初始化节点集合
    // this.nodes = this.data.nodes.map((item: any, index: number) => {
    //   this.idMap.set(item.id.toString(), index);
    //   return Object({
    //     id: item.id.toString(),
    //     start: item.start - minPiece,
    //     end: item.end - minPiece,
    //     x: 0,
    //     y: 0,
    //   });
    // });
    this.nodes = this.data.nodes.map((item: any, index: number) => {
      this.idMap.set(item.name.toString(), index);
      return Object({
        id: item.name.toString(),
        start: item.start - minPiece,
        end: item.end - minPiece,
        x: 0,
        y: 0,
      });
    });
    // 初始化连边集合
    this.links = this.data.links.map((item: any, index: number) =>
      Object({
        id: 'link' + index.toString(),
        source: item.source.toString(),
        target: item.target.toString(),
        start: item.start - minPiece,
        end: item.end - minPiece,
      })
    );
    // 初始化时间片数
    this.pieces = maxPiece - minPiece + 1;
  }

  // 初始化节点位置，采取随机方式
  private initNodePosition(): void {
    for (let i = 0; i < this.nodes.length; i++) {
      const radius = 10 * Math.sqrt(i),
        angle = i * Math.PI * (3 - Math.sqrt(5));
      this.nodes[i].x = radius * Math.cos(angle);
      this.nodes[i].y = radius * Math.sin(angle);
      this.nodes[i].isRandom = true;
    }
  }

  getTimeSlice(slice: number): GraphInfo {
    // 如果当前时间片是计算的最后一个时间片，则提前计算下一时间片
    if (this.graphInfo.length === slice + 1 && slice + 1 < this.pieces)
      this.prepareNextSlice(slice + 1);
    return this.graphInfo[slice];
  }

  private prepareNextSlice(slice: number): void {
    // console.log('prepare', slice);
    const node: NodeInfo[] = this.nodes.filter(
      (item) => item.start <= slice && item.end >= slice
    );
    const link: LinkInfo[] = this.links.filter(
      (item) => item.start <= slice && item.end >= slice
    );
    // console.time("calc");
    // const retNode: NodePosition[] = calculateGraph(node, link);
    // console.timeEnd("calc");
    // this.updateGraphSlice({
    //     nodes: retNode,
    //     edges: link
    // });
    calcGraphWithWorker({ node, link }).then((result) => {
      // console.log(result);
      this.updateGraphSlice({
        nodes: result,
        edges: link,
      });
    });
    return;
  }

  private updateGraphSlice(graphInfo: GraphInfo): void {
    graphInfo.nodes.forEach((item) => {
      const id = this.idMap.get(item.id);
      if (id === undefined) throw Error('全局ID 错误');
      this.nodes[id] = {
        ...this.nodes[id],
        x: item.x,
        y: item.y,
        isRandom: false,
      };
    });
    this.graphInfo.push(graphInfo);
  }
}
export default DynamicGraph;
