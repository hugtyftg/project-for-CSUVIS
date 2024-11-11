export interface LevelInfo {
  index: number;
  key: string;
}

export interface Device {
  index: number;
  az: string;
  pod_name: string;
}
export interface OriginData {
  compressionRatio: number;
  groupList: GroupNode[];
  groupLinks: GroupLink[];
}
export interface GroupNode {
  groupIndex: number;
  children: Device[];
}
export interface GroupLink {
  source: number;
  target: number;
}

// 层级结构基本信息
export interface LevelStructure {
  name: string;
  hierarchy: string;
}
// 非底层结构
export interface BoneStructure extends LevelStructure {
  children: BoneStructure[] | BottomStructure[];
}
// 底层结构
export interface BottomStructure extends LevelStructure {
  num: number;
  [key: string]: any;
}
