import { SimulationLinkDatum, SimulationNodeDatum } from 'd3-force';

export type ID = string;

export interface NodeDatum extends SimulationNodeDatum {
  id: ID;
  pos: number;
  mobility: number;
  mov: number;
  confidence: number;
  age: number;
  pinWeight: number;
  prev?: NodeDatum;
}

export interface LinkDatum<N extends NodeDatum = NodeDatum>
  extends SimulationLinkDatum<N> {
  id: ID;
  startPoint: N;
  endPoint: N;
  start: number;
  end: number;
  source: string | N;
  target: string | N;
}
export interface OriginNode {
  name: string;
  type: string;
  id: number;
  start: number;
  end: number;
}
export interface OriginLink {
  id: string;
  relation: string;
  from: number;
  to: number;
  source: string;
  target: string;
  start: number;
  end: number;
}
export interface GroupData {
  nodes: OriginNode[];
  links: OriginLink[];
}

export type MetricsType = {
  energy: number;
  deltaPos: number;
  deltaLen: number;
  deltaDir: number;
  deltaOrth: number;
  DCQ: number;
};
