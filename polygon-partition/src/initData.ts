import {
  LevelInfo,
  GroupData,
  LevelStructure,
  BoneStructure,
  BottomStructure,
} from './interface';
import { v7 as uuid } from 'uuid';

function InitData(
  originData: GroupData,
  levelNum: number,
  levelInfoList: LevelInfo[]
) {
  // 如果层级数与传入的层级信息数不匹配，直接返回
  if (levelNum !== levelInfoList.length) return;
  if (!levelNum) return;
  const nodes = originData.groupList;
  // 统一处理参数，升序
  levelInfoList = levelInfoList.sort((a: LevelInfo, b: LevelInfo) => {
    return a.index - b.index;
  });

  let result: BoneStructure = {
    id: uuid(),
    name: levelInfoList[0].key,
    hierarchy: levelInfoList[0].key,
    children: [],
  };

  // 遍历每个节点建立层级结构
  for (let i = 0; i < nodes.length; i++) {
    const curNode = nodes[i];

    let targetLevelStructure = result;
    for (let count = 1; count < levelInfoList.length; count++) {
      const levelInfo = levelInfoList[count];
      const hierarchyKey = levelInfo.key;

      // 寻找是否有该level item（BoneStructure）或者（BottomStructure），
      let index = targetLevelStructure.children.findIndex(
        (child: LevelStructure) => {
          return child.name === curNode.children[0][hierarchyKey];
        }
      );

      // 如果没有则创建一个并且push入当前target children
      if (index === -1) {
        const newLevelItem = {
          id: uuid(),
          name: curNode.children[0][hierarchyKey],
          hierarchy: hierarchyKey,
        };
        targetLevelStructure.children.push(newLevelItem as any);
        index = targetLevelStructure.children.length - 1;
      }

      const curLevelItem = targetLevelStructure.children[index];

      // 非最后一层
      if (count !== levelInfoList.length - 1) {
        // 新创建出来的没有children property
        if (!curLevelItem.hasOwnProperty('children')) {
          Object.defineProperty(curLevelItem, 'children', {
            value: [],
            writable: true,
            enumerable: true,
            configurable: true,
          });
        }
        // 更新下一次迭代所基于的targetLevelItem
        targetLevelStructure = curLevelItem as BoneStructure;
      } else {
        // 最后一层
        // 新创建出来的没有children property
        if (!curLevelItem.hasOwnProperty('num')) {
          Object.defineProperties(curLevelItem, {
            num: {
              value: 0,
              writable: true,
              enumerable: true,
              configurable: true,
            },
            nodes: {
              value: [],
              writable: true,
              enumerable: true,
              configurable: true,
            },
          });
        }
        // 为每个到达最终位置的节点添加num
        (curLevelItem as BottomStructure).num++;
        (curLevelItem as BottomStructure).nodes.push(curNode);
      }
    }
  }
  return result;
}
function getLevelStructure() {}
export default InitData;
