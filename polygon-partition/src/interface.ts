export interface LevelInfo {
  index: number;
  key: string;
}

export interface Device {
  index: number;
  az: string | undefined;
  pod_name: string | undefined;
  type: string | undefined;
  role: string | undefined;
  mgmt_ip: string;
  is_alarming: boolean;
  degree: number;
}
export interface GroupData {
  compressionRatio: number;
  groupList: GroupNode[];
  groupLinks: GroupLink[];
}
export interface GroupNode {
  groupIndex: number;
  isHyperNode: boolean;
  size: number;
  children: Device[];
  isPerfectPod: boolean;
  /* 多层级适配时会修改 */
  az: string;
  pod: string;
}

export interface GroupLink {
  source: number;
  target: number;
}

// 层级结构基本信息
export interface LevelStructure {
  id: string;
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
