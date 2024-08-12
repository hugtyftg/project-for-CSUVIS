importScripts('./calcNode.js');
function calculateGraph(node, link) {
  // 节点转换为当前时间片内下标
  const idMap = new Map();
  const nodePosition = [];
  const nodeExtraInfo = [];
  const linkInfo = [];
  const retNodePosition = [];
  node.forEach((item, index) => {
    idMap.set(item.id, index);
    nodePosition.push(item.x, item.y);
    nodeExtraInfo.push(item.isRandom ? 1 : 0);
    retNodePosition.push({ id: item.id, x: 0, y: 0 });
  });
  link.forEach((item) => {
    const source = idMap.get(item.source);
    const target = idMap.get(item.target);
    if (source === undefined || target === undefined)
      throw Error('局部ID 错误');
    linkInfo.push(source, target);
  });
  const nodePosArray = new Float32Array(nodePosition);
  const nodeInfoArray = new Int32Array(nodeExtraInfo);
  const linkArray = new Int32Array(linkInfo);
  const nodeNum = node.length;
  const linkNum = link.length;
  // 分配内存
  const calcPosition = Module.cwrap('calcPosition', 'null', [
    'number',
    'number',
    'number',
    'number',
    'number',
    'number',
  ]);

  const nodePosPtr = Module._malloc(
    nodePosArray.length * nodePosArray.BYTES_PER_ELEMENT
  );
  const nodeInfoPtr = Module._malloc(
    nodeInfoArray.length * nodeInfoArray.BYTES_PER_ELEMENT
  );
  const linkPtr = Module._malloc(
    linkArray.length * linkArray.BYTES_PER_ELEMENT
  );
  const outputPtr = Module._malloc(
    nodePosArray.length * nodePosArray.BYTES_PER_ELEMENT
  );

  Module.HEAPF32.set(nodePosArray, nodePosPtr / nodePosArray.BYTES_PER_ELEMENT);
  Module.HEAP32.set(
    nodeInfoArray,
    nodeInfoPtr / nodeInfoArray.BYTES_PER_ELEMENT
  );
  Module.HEAP32.set(linkArray, linkPtr / linkArray.BYTES_PER_ELEMENT);
  calcPosition(nodePosPtr, nodeInfoPtr, nodeNum, linkPtr, linkNum, outputPtr);
  const outputArray = new Float32Array(
    Module.HEAP32.buffer,
    outputPtr,
    nodeNum * 2
  );

  retNodePosition.forEach((item, index) => {
    item.x = outputArray[index * 2];
    item.y = outputArray[index * 2 + 1];
  });
  // 释放内存
  Module._free(nodePosPtr);
  Module._free(nodeInfoPtr);
  Module._free(linkPtr);
  Module._free(outputPtr);

  return retNodePosition;
}

// 接受信息
self.onmessage = ({ data: { node, link } }) => {
  console.log('receive graph');
  const data = calculateGraph(node, link);
  postMessage(data);
};
