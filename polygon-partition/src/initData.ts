import {
  LevelInfo,
  OriginData,
  LevelStructure,
  BoneStructure,
  BottomStructure,
} from './interface';

function InitData(
  originData: OriginData,
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
    name: levelInfoList[0].key,
    hierarchy: levelInfoList[0].key,
    children: [],
  };

  for (let i = 0; i < nodes.length; i++) {
    // debugger;
    const curNode = nodes[i];

    for (const levelInfo of levelInfoList) {
      let count = 0;
      let targetLevelStructure: BoneStructure | BottomStructure = result;
      // 找到目标层级，如果没有就一直创建
      while (count < levelInfo.index) {
        count++;
        let hierarchyKey = levelInfoList[count].key;
        let nextIndex = targetLevelStructure.children.findIndex(
          (child: LevelStructure) => {
            return child.name === curNode.children[0][hierarchyKey];
          }
        );
        if (nextIndex === -1) {
          const newChild = {
            name: curNode.children[0][hierarchyKey],
            hierarchy: hierarchyKey,
          };
          targetLevelStructure.children.push(newChild);
          nextIndex = targetLevelStructure.children.length - 1;
        }
        targetLevelStructure = targetLevelStructure.children[nextIndex];

        if (count === levelNum - 1) {
          // 是最后一层
          if (!targetLevelStructure.hasOwnProperty('num')) {
            Object.defineProperty(targetLevelStructure, 'num', {
              enumerable: true,
              configurable: true,
              writable: true,
              value: 1,
            });
          } else {
            (targetLevelStructure as BottomStructure).num++;
          }
        } else {
          // 是中间层
          if (!targetLevelStructure.hasOwnProperty('children')) {
            Object.defineProperty(targetLevelStructure, 'children', {
              enumerable: true,
              configurable: true,
              writable: true,
              value: [],
            });
          }
        }
      }
    }
  }
  return result;
}
function getLevelStructure() {}
export default InitData;
