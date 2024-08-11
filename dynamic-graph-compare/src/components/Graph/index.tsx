import React, { useEffect, useMemo, useRef } from 'react';
import { LinkInfo, NodePosition } from '../../algorithm/types';
import Node from '../Node';
import { GRAPH_DEFAULT_CONFIG, StyleCfg } from '../../config';
import Edge from '../Edge';
import { S } from './style';
import { select, zoom, zoomIdentity } from 'd3';
type GraphType = {
  id: string; // 每个svg的唯一标识
  nodes: NodePosition[]; // 需要绘制的nodes
  edges: LinkInfo[]; // 需要绘制的edges
  styleCfg: StyleCfg; // 点边样式
};
export default function Graph({ id, nodes, edges, styleCfg }: GraphType) {
  const {
    width,
    height,
    nodeStyle: nodeCfg,
    edgeStyle: edgeCfg,
  } = Object.assign(GRAPH_DEFAULT_CONFIG, styleCfg);

  /* 获取edge数据 */
  const curTimeEdges = useMemo(() => {
    const result = [];
    for (const edge of edges) {
      const [x1, y1] = getNodeCoordinate(edge.source);
      const [x2, y2] = getNodeCoordinate(edge.target);
      const newEdge: LinkInfo & {
        x1: number;
        y1: number;
        x2: number;
        y2: number;
      } = { ...edge, x1, y1, x2, y2 };
      result.push(newEdge);
    }
    function getNodeCoordinate(targetNodeId: string): [number, number] {
      let targetNode: NodePosition | undefined = nodes.find(
        (node: NodePosition) => node.id === targetNodeId
      );
      if (targetNode) {
        return [targetNode.x, targetNode.y];
      } else {
        console.error('该连边的端点不存在于当前时间片中');
        return [0, 0];
      }
    }
    return result;
  }, [edges, nodes]);

  /* zoom pinning */
  const zoomCanvasHandler = (
    width: number,
    height: number,
    svg: any,
    container: any
  ) => {
    // zoom 解决pinning的抖动问题：zoom事件绑定在svg，transform绑定在svg下面的container
    const zoomObj = zoom()
      .translateExtent([
        [-width * 5, -height * 5],
        [width * 5, height * 5],
      ])
      .scaleExtent([0.5, 20])
      .on('zoom', (event: any) => {
        container.attr('transform', event.transform);
      });
    svg
      .call(zoomObj)
      // 指定初始缩放状态，注意，scale是按照面积放缩的，需要开根号
      .call(
        zoomObj.transform,
        zoomIdentity.scale(1).translate(width / 2, height / 2)
        // .scale(0.99)
        // .translate(
        //   width * (1 - Math.sqrt(0.99)),
        //   height * (1 - Math.sqrt(0.99))
        // )
      )
      // 禁止双击自动放缩
      .on('dblclick.zoom', null);
  };
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<SVGGElement | null>(null);
  useEffect(() => {
    if (svgRef.current && containerRef.current) {
      const divBox = select(`#${id}`);
      const svg = divBox.select('#graph-svg');
      const container = svg.select('#graph-container');
      zoomCanvasHandler(width, height, svg, container);
    }
  }, [height, width, id]);

  return (
    <S.GraphContainer
      width={width}
      height={height}
      className="graph-box"
      id={id}
    >
      <svg id="graph-svg" width={width} height={height} ref={svgRef}>
        <g id="graph-container" ref={containerRef}>
          <g className="edges-group">
            {curTimeEdges.map((edge: LinkInfo & { [prop: string]: any }) => {
              return (
                <Edge
                  key={edge.id}
                  x1={edge.x1}
                  y1={edge.y1}
                  x2={edge.x2}
                  y2={edge.y2}
                  {...edgeCfg}
                />
              );
            })}
          </g>
          <g className="nodes-group">
            {nodes.map((node: NodePosition) => {
              return (
                <Node
                  key={node.id}
                  id={node.id}
                  cx={node.x}
                  cy={node.y}
                  {...nodeCfg}
                  // 新旧节点颜色不同
                  fill={node?.isNew ? nodeCfg.fill : nodeCfg.oldfill}
                />
              );
            })}
          </g>
        </g>
      </svg>
    </S.GraphContainer>
  );
}
