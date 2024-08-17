import { BoneStructure, BottomStructure } from './interface';

function getFlattenBottom(hierarchalData: BoneStructure) {
  let result = [];
  preOrderTraverse(hierarchalData, result);
  return result;
}
function preOrderTraverse(
  hierarchalData: BoneStructure | BottomStructure,
  result: BottomStructure[]
) {
  if (!hierarchalData) {
    return;
  }
  if (!hierarchalData.children) {
    result.push(hierarchalData as BottomStructure);
    return;
  }

  hierarchalData.children.forEach((child) => {
    preOrderTraverse(child, result);
  });
}

export default getFlattenBottom;
