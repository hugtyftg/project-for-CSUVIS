import { nestedVoronoi, centralizing } from './layout';
import { scaleLinear } from 'd3-scale';
import getHierarchalData from './dataPrehandle';
import render from './render';
import { hierarchy } from 'd3-hierarchy';

const setting = {
  width: 1900,
  height: 1900,
  strokeWidth: {
    az: 10,
    pod: 2,
  },
};

(async (datasetName: string) => {
  const res = await fetch(datasetName);
  const originData = await res.json();
  // 1.树形结构
  let hierarchalData = getHierarchalData(originData);
  console.log(hierarchalData);

  // 2.统计树形结构各层级权重
  let data = hierarchy(hierarchalData).sum((d) => d.num ?? 0);

  // 3.定义矩形边界几何信息
  let rectanglePolygon = [
    [0, 0],
    [0, setting.height],
    [setting.width, setting.height],
    [setting.width, 0],
  ];
  const treemapCenter = [setting.width / 2, setting.height / 2];

  // 4.设置每个数据集的标识符，保证分割结果一致
  const datasetIndentifier = 0;

  // 5.根据树形结构分割画布
  let canvasSpliter = nestedVoronoi(datasetIndentifier).clip(rectanglePolygon);
  canvasSpliter(data);
  /* ------------------cnt中心化----------------- */
  for (let i = 0; i < (data.children as any).length; i++) {
    centralizing((data as any).children[i], 'name', 'cnt');
  }
  /* ------------------cnt中心化----------------- */

  // 6.（可选）设置分割区域根据权重设置颜色插值范围
  let min = Infinity; // 记录最少的设备数目
  let max = 0; // 记录最多的设备数目
  const nodes: any = [];
  (data.children as any[]).forEach((az: any) => {
    nodes.push(az);
    az.children.forEach((pod: any) => {
      if (pod.value < min) {
        min = pod.value;
      }
      if (pod.value > max) {
        max = pod.value;
      }
      pod['isAlarming'] = false; // TODO：和告警结合
      nodes.push(pod);
    });
  });
  let colorScale = scaleLinear()
    .domain([min, max])
    .range([0.8, 0.55])
    .clamp(true);

  // 7.渲染各区域
  render({
    selector: '#container',
    setting,
    treemapCenter,
    rectanglePolygon,
    nodes,
    colorScale,
    min,
    max,
  });
})('./data/2021-09-03 网络大脑脱敏数据文件(清洗pod_name).json');
