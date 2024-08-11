export interface NodeInfo {
  id: string;
  start: number;
  end: number;
  x: number;
  y: number;
  isRandom?: boolean;
}

export interface LinkInfo {
  id: string;
  source: string;
  target: string;
  start: number;
  end: number;
  [prop: string]: any;
}

export interface NodePosition {
  id: string;
  x: number;
  y: number;
  [prop: string]: any;
}

export interface GraphInfo {
  nodes: NodePosition[];
  edges: LinkInfo[];
}
