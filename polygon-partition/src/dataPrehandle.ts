import { NonBottomLevel } from './interface';

function getHierarchalData(data) {
  let nodes = data.nodes;
  let links = data.links;
  console.log('nodes num', nodes.length);
  console.log('edge num', links.length);
  // 确定层级关系
  let result: NonBottomLevel = {
    name: 'region',
    hierarchy: 'region',
    children: [],
  };
  let curAz,
    curAzName,
    curAzNameIndex,
    curPodName,
    curPodNameIndex,
    curIp,
    curType,
    curRole;
  // 添加节点
  for (let i = 0; i < nodes.length; i++) {
    curAzName = nodes[i]['az'];
    curPodName = nodes[i]['pod_name'] === null ? 'null' : nodes[i]['pod_name'];
    curType = nodes[i]['type'];
    curRole = nodes[i]['role'];
    curIp = nodes[i]['mgmt_ip'];

    // 1.检查当前result里面是否已经有当前az
    curAzNameIndex = result['children'].findIndex(
      (az) => az.name === curAzName
    );
    // 如果没有则添加该az和空数组，否则在这一层什么也不做
    if (curAzNameIndex === -1) {
      result['children'].push({
        name: curAzName,
        hierarchy: 'az',
        children: [],
      });
    }

    // 2.检查当前az里面是否已经有当前pod
    curAzNameIndex =
      curAzNameIndex === -1 ? result['children'].length - 1 : curAzNameIndex;
    curAz = result['children'][curAzNameIndex];
    curPodNameIndex = curAz['children'].findIndex(
      (pod) => pod.name === curPodName
    );
    // 如果没有则添加该pod和空数组，否则在这一层什么也不做
    if (curPodNameIndex === -1) {
      curAz['children'].push({
        name: curPodName,
        hierarchy: 'pod',
        num: 0,
        nodes: [], // 记录当前pod里面所有节点的mgmt_ip
        edges: [], // 记录当前pod里面的所有连边关系
      });
    }

    // 3.添加节点
    curPodNameIndex =
      curPodNameIndex === -1 ? curAz['children'].length - 1 : curPodNameIndex;
    curAz['children'][curPodNameIndex]['num'] += 1;
    curAz['children'][curPodNameIndex]['nodes'].push({
      ip: curIp,
      az: curAzName,
      type: curType,
      role: curRole,
      pod_name: curPodName,
    });
  }

  return result;
}

export default getHierarchalData;
