import { scaleLinear } from 'd3-scale';
import { select } from 'd3-selection';
import { interpolateRdBu } from 'd3';

interface RenderOpts {
  selector: string;
  setting: any;
  treemapCenter: number[];
  rectanglePolygon: number[][];
  nodes: any;
  colorScale: any;
  min: number;
  max: number;
}
const render = (opts: RenderOpts) => {
  const {
    selector,
    setting,
    treemapCenter,
    rectanglePolygon,
    nodes,
    colorScale,
    min,
    max,
  } = opts;
  const container = select(selector);
  const svg = container.append('svg');
  svg.attr('width', setting.width + 100).attr('height', setting.height + 100);
  const g = svg.append('g').attr('id', 'graph');

  // 初始化布局
  let treemapContainer = g
    .append('g')
    .classed('treemap-container', true)
    .attr('transform', `translate(${treemapCenter})`);
  // 绘制矩形region框
  treemapContainer
    .append('path')
    .classed('Region', true)
    .attr('id', 'region')
    .attr(
      'transform',
      `translate(${[-setting.width / 2, -setting.height / 2]})`
    )
    .attr('d', 'M' + rectanglePolygon.join('L') + 'Z')
    .attr('fill', '#fff');
  // 绘制voronoi cell
  let voronoiPodCell = treemapContainer
    .append('g')
    .classed('voronoiPodCell', true)
    .attr(
      'transform',
      `translate(${[-setting.width / 2, -setting.height / 2]})`
    )
    .selectAll('path')
    .data(nodes)
    .enter();

  voronoiPodCell
    .append('path')
    .attr('class', (d: any) => d.data.hierarchy)
    .attr('name', (d: any) => {
      if (d.data.hierarchy === 'az') {
        return d.data.name;
      } else if (d.data.hierarchy === 'pod') {
        return d.parent.data.name;
      }
    })
    .attr('id', (d: any) => {
      if (d.data.hierarchy === 'pod') {
        return d.data.name;
      }
    })
    .attr('d', (d: any) => {
      return 'M' + d.polygon.join('L') + 'Z';
    })
    .attr('fill', (d: any) => {
      if (d['data']['hierarchy'] === 'az') {
        return interpolateRdBu(colorScale(d.value));
      } else if (d['data']['hierarchy'] === 'pod') {
        if (d.data.name === 'cnt') {
          return 'pink';
        }
        if (d.depth === 1) {
          return 'transparent';
        } else {
          return interpolateRdBu(colorScale(d.value));
        }
      }
      return 'gray';
    })
    .attr('stroke', '#fff')
    .attr('stroke-width', (d: any) => setting['strokeWidth'][d.data.hierarchy]);

  // 绘制文字，标签大小自适应
  let fontScale = scaleLinear().domain([min, max]).range([10, 60]).clamp(true);
  let labels = treemapContainer
    .append('g')
    .classed('labels', true)
    .attr(
      'transform',
      `translate(${[-setting.width / 2, -setting.height / 2]})`
    )
    .selectAll('labels')
    .data(nodes)
    .enter()
    .append('g')
    .attr('class', (d: any) => d.data.hierarchy)
    .attr('id', (d) => getPodName(d))
    .attr('transform', (d: any) => {
      // TODO2: 标签位置自适应
      return `translate(${[
        d.polygon.site.x - (fontScale(d.value) * getPodName(d).length) / 4,
        d.polygon.site.y + fontScale(d.value) / 2,
      ]})`;
    })
    .style('font-size', (d: any) => {
      return fontScale(d.value);
    });

  labels
    .append('text')
    .classed('name', true)
    .html((d) => getPodName(d));
};

function getPodName(thisDatum) {
  return thisDatum.data?.name ?? 'null';
}

export default render;
