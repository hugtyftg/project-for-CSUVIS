import { NodePosition } from '@/algorithm/types';

export const markNewNode = (
  newNodes: NodePosition[],
  oldNodes: NodePosition[]
) => {
  if (newNodes) {
    /* 为新节点添加标识isNew */
    for (let i = 0; i < newNodes.length; i++) {
      const newNode = newNodes[i];
      const oldIndex: number = oldNodes.findIndex((node: NodePosition) => {
        return node.id === newNode.id;
      });
      if (oldIndex !== -1) {
        newNode.isNew = false;
        continue;
      }
      newNode.isNew = true;
    }
  }
};
