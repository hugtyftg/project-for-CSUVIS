export interface NonBottomLevel {
  name: string;
  hierarchy: string;
  children: NonBottomLevel[];
  num?: number;
}

export interface BottomLevel {
  name: string;
  hierarchy: string;
  nodes: any[];
  edges: any[];
  num: number;
}
