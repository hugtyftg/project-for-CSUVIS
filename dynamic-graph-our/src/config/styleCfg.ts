interface StyleCfg {
  width: number;
  height: number;
  nodeStyle: NodeStyle;
  edgeStyle: EdgeStyle;
}
interface NodeStyle {
  fill: string;
  oldfill: string;
  r: number;
  stroke: string;
  strokeWidth: number;
  opacity: number;
}
interface EdgeStyle {
  stroke: string;
  strokeWidth: number;
  opacity: number;
}
export type { StyleCfg, NodeStyle, EdgeStyle };
