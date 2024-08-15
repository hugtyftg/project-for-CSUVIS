import {LinkInfo, NodeInfo, NodePosition} from './types';

function calculateGraph(node: NodeInfo[], link: LinkInfo[]): NodePosition[]
{
    // 节点转换为当前时间片内下标
    const idMap: Map<string, number> = new Map();
    const nodePosition: number[] = [];
    const nodeExtraInfo: number[] = [];
    const linkInfo: number[] = [];
    const retNodePosition : NodePosition[] = [];
    node.forEach((item, index) =>
    {
        idMap.set(item.id, index);
        nodePosition.push(item.x, item.y);
        nodeExtraInfo.push(item.isRandom ? 1 : 0);
        retNodePosition.push({id:item.id, x:0, y:0});
    });
    link.forEach((item) =>
    {
        const source = idMap.get(item.source);
        const target = idMap.get(item.target);
        if (source === undefined || target === undefined)
            throw Error('局部ID 错误');
        linkInfo.push(source, target);
    });
    // @ts-ignore
    // Module.onRuntimeInitialized = (): void =>
    // {
    const nodePosArray = new Float32Array(nodePosition);
    const nodeInfoArray = new Int32Array(nodeExtraInfo);
    const linkArray = new Int32Array(linkInfo);
    const nodeNum = node.length;
    const linkNum = link.length;

    // @ts-ignore
    const calcPosition = Module.cwrap('calcPosition', 'null',
        ['number', 'number', 'number', 'number', 'number', 'number']);

    // @ts-ignore
    const nodePosPtr = Module._malloc(nodePosArray.length * nodePosArray.BYTES_PER_ELEMENT);
    // @ts-ignore
    const nodeInfoPtr = Module._malloc(nodeInfoArray.length * nodeInfoArray.BYTES_PER_ELEMENT);
    // @ts-ignore
    const linkPtr = Module._malloc(linkArray.length * linkArray.BYTES_PER_ELEMENT);
    // @ts-ignore
    const outputPtr = Module._malloc(nodePosArray.length * nodePosArray.BYTES_PER_ELEMENT);
    // @ts-ignore
    Module.HEAPF32.set(nodePosArray, nodePosPtr / nodePosArray.BYTES_PER_ELEMENT);
    // @ts-ignore
    Module.HEAP32.set(nodeInfoArray, nodeInfoPtr / nodeInfoArray.BYTES_PER_ELEMENT);
    // @ts-ignore
    Module.HEAP32.set(linkArray, linkPtr / linkArray.BYTES_PER_ELEMENT);
    calcPosition(nodePosPtr, nodeInfoPtr, nodeNum, linkPtr, linkNum, outputPtr);
    // @ts-ignore
    const outputArray = new Float32Array(Module.HEAP32.buffer, outputPtr, nodeNum*2);

    // console.log(outputArray);
    retNodePosition.forEach((item, index)=>{
        item.x = outputArray[index*2];
        item.y = outputArray[index*2+1];
    })

    // @ts-ignore
    Module._free(nodePosPtr);
    // @ts-ignore
    Module._free(nodeInfoPtr);
    // @ts-ignore
    Module._free(linkPtr);
    // @ts-ignore
    Module._free(outputPtr)
    // };
    return retNodePosition;
}

export default calculateGraph;