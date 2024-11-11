import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import Button from '../Button';
import {
  LinkDatum,
  MetricsType,
  NodeDatum,
  GroupData,
  ageMobility,
  degreeMobility,
  markovMobility,
  pinningWeightMobility,
} from '../../compare';
import { Graph, GraphData } from '@antv/g6';
import initNodePos from '../../compare/pos/initNodePos';
import SvgGraph from '../Graph';
import { StyleCfg } from '../../config/styleCfg';
import { LinkInfo, NodePosition } from '../../algorithm/types';
import { S } from './style';
import Metrics from '../Metrics';
import { markNewNode } from '@/utils';
import { constants } from '@/config/g6Cfg';
import { datasetConfigs } from '@/config/NodeGraphSize';
import { EvalMetrics } from '@/metrics';
const config: StyleCfg = {
  width: 1400,
  height: 1400,
  // nodeStyle: {
  //   fill: 'var(--color-node-new)',
  //   oldfill: 'var(--color-node-old)',
  //   r: 1.5,
  //   stroke: 'white',
  //   strokeWidth: 0.2,
  //   opacity: 1,
  // },
  // edgeStyle: {
  //   stroke: 'gray',
  //   strokeWidth: 0.2,
  //   opacity: 1,
  // },
  nodeStyle: {
    fill: 'var(--color-node-new)',
    oldfill: 'var(--color-node-old)',
    r: 5,
    stroke: 'white',
    strokeWidth: 0.8,
    opacity: 1,
  },
  edgeStyle: {
    stroke: 'gray',
    strokeWidth: 0.8,
    opacity: 1,
  },
};
// node中用于唯一标识id的键
const key = 'name';
type CompareNodeGraphType = {
  data: GroupData;
  algorithm: string[];
  panelTime: number;
  calcMetrics: boolean;
};

const CompareNodeGraph = forwardRef(function (
  { data, algorithm, panelTime, calcMetrics }: CompareNodeGraphType,
  parentRef: any
) {
  const datasetName = localStorage.getItem('datasetName');
  const curDatasetInfo =
    datasetConfigs.find((item) => item.name === datasetName) ??
    datasetConfigs[0];

  // 收集某个算法在某个数据集下的所有数据
  const allDataRef = useRef<any[]>([]);
  // 存放G6生成的图实例
  const graph = useRef<Graph | null>(null);
  const [timeRestriction, setTimeRestriction] = useState(Infinity);
  const [time, defaultSetTime] = useState(panelTime);
  const ref = useRef<HTMLDivElement | null>(null);
  const prevState = useRef<{ nodes: NodeDatum[]; edges: LinkDatum[] }>({
    nodes: [],
    edges: [],
  });
  const [nodes, setNodes] = useState<NodePosition[]>([]);
  const [edges, setEdges] = useState<LinkInfo[]>([]);

  // 是否完成布局计算
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  // 布局计算和渲染所用时间
  const timeUsageRef = useRef<number>(0);
  // 记录目前所有时间片布局时间历史
  const timeHistory = useRef<number[]>([]);
  const [curTotalTime, setCurTotalTime] = useState<number>(0);
  const [curConsumeTime, setCurConsumeTime] = useState<number>(0);

  // 自动播放所有时间片
  const [isAuto, setIsAuto] = useState<boolean>(false);
  // 每次布局计算结束后计算的指标，包括图布局能量、位置偏移量等
  const metrics = useRef<MetricsType[]>([]);
  const [energy, setEnergy] = useState<number>(0);
  const [deltaDir, setDeltaDir] = useState<number>(0);
  const [deltaLen, setDeltaLen] = useState<number>(0);
  const [deltaOrth, setDeltaOrth] = useState<number>(0);
  const [deltaPos, setDeltaPos] = useState<number>(0);
  const [DCQ, setDCQ] = useState<number>(0);
  // 是否开启指标计算模式：直接的primitive value不生效
  const calMetricsRef = useRef<Boolean>(calcMetrics);
  useEffect(() => {
    calMetricsRef.current = calcMetrics;
  }, [calcMetrics]);
  useImperativeHandle(parentRef, () => {
    return {
      setIsAuto,
    };
  });
  // 根据data设置最大时间片作为时间限制
  useEffect(() => {
    if (data) {
      setTimeRestriction(
        data.nodes.reduce((max, node) => {
          if (max < node.end) {
            max = node.end;
          }
          return max;
        }, -1)
      );
    }
  }, [data]);

  // 下载当前时间片的数据，JSON格式
  const downloadCurTimeJsonData = () => {
    const download = (url: string, name: string) => {
      const a = document.createElement('a');
      a.href = url;
      a.download = name;
      a.click();
    };
    const jsonStr = JSON.stringify(allDataRef.current);
    const url = `data:,${jsonStr}`;
    const name = `${localStorage.getItem('datasetName')}.json`;
    download(url, name);
  };
  useEffect(() => {
    // 初始化图实例
    if (!graph.current) {
      graph.current = new Graph({
        container: ref.current as HTMLElement,
        width: 0,
        height: 0,
        layout: {
          ...constants,
          restrictions: algorithm,
          onLayoutEnd: () => {
            setIsCalculating(false);

            const newSliceConsume = Number(
              (performance.now() - timeUsageRef.current).toFixed(0)
            );
            timeHistory.current.push(newSliceConsume);
            console.log(timeHistory.current);

            setCurConsumeTime(newSliceConsume);
            setCurTotalTime(
              (curTotalTime) => (curTotalTime += newSliceConsume)
            );
            const { edges: oldEdges, nodes: oldNodes } = prevState.current;
            const { edges, nodes } = (graph.current?.save() ?? {
              edges: [],
              nodes: [],
            }) as unknown as {
              edges: LinkDatum[];
              nodes: NodeDatum[];
            };
            if (calMetricsRef.current) {
              let res: MetricsType;
              res = {
                ...new EvalMetrics(
                  { nodes, links: edges },
                  constants.linkDistance,
                  { nodes: oldNodes, links: oldEdges }
                ).all(),
              };
              metrics.current.push(res);
              setEnergy(Number(res.energy.toFixed(2)));
              setDeltaDir(Number(res.deltaDir.toFixed(2)));
              setDeltaLen(Number(res.deltaLen.toFixed(2)));
              setDeltaOrth(Number(res.deltaOrth.toFixed(2)));
              setDeltaPos(Number(res.deltaPos.toFixed(2)));
              setDCQ(Number(res.DCQ.toFixed(2)));
            }
            nodes &&
              markNewNode(
                nodes as unknown as NodePosition[],
                oldNodes as unknown as NodePosition[]
              );
            setNodes(nodes as any);
            setEdges(edges as any);
          },
        },
      });
    }
    // 在每个时间片中进行以下步骤：
    // 1.获取当前时间片应有的点边数据
    // 2.获取上一个时间片应有的点边数据
    // 3.初始化位置
    // 4.应用限制算法
    // 5.在G6图实例中迭代计算布局
    if (data && graph.current && time > 0) {
      setIsCalculating(true);
      timeUsageRef.current = performance.now();
      const processedData: GraphData = {
        nodes: data.nodes
          .filter((node) => {
            return (node.start ?? -1) <= time && (node.end ?? Infinity) >= time;
          })
          .map((node) => ({
            ...node,
            // key是name
            id: node[key] as string,
            ...graph.current?.findById(node[key])?._cfg?.model,
          })),
        edges: data.links
          .filter((link) => {
            return (link.start ?? -1) <= time && (link.end ?? Infinity) >= time;
          })
          .map((link) => ({
            ...link,
            id: link.id.toString(),
            source: link.source.toString(),
            target: link.target.toString(),
          })),
      };

      // 上一个时间片的点边数据，初始化时为空
      prevState.current = (graph.current?.save() ?? {
        edges: [],
        nodes: [],
      }) as unknown as {
        edges: LinkDatum[];
        nodes: NodeDatum[];
      };
      const { edges: oldEdges, nodes: oldNodes } = prevState.current;
      // 当前时间片的点边数据
      const { edges, nodes } = processedData as unknown as {
        edges: LinkDatum[];
        nodes: NodeDatum[];
      };
      // 初始化位置
      initNodePos(oldNodes, oldEdges, nodes, edges);

      // 应用限制算法
      if (algorithm.includes('markov mobility')) {
        markovMobility(oldNodes, oldEdges, nodes, edges);
      } else if (algorithm.includes('degree mobility')) {
        degreeMobility(oldNodes, oldEdges, nodes, edges);
      } else if (algorithm.includes('age mobility')) {
        ageMobility(oldNodes, oldEdges, nodes, edges);
      } else if (algorithm.includes('pinning weight mobility')) {
        pinningWeightMobility(oldNodes, oldEdges, nodes, edges);
      }
      // 在G6中迭代计算
      graph.current?.data(processedData);
      // 问题：restricted force layout并没有成功写入G6自定义布局中
      graph.current.render();
    }
  }, [time, algorithm, data, calcMetrics]);

  // 自动播放模式，一旦isCalculating为false的时候就表示上一个时间片的计算和渲染已经完成，开启下一个时间片
  useEffect(() => {
    if (isAuto && !isCalculating) {
      defaultSetTime((time) => {
        if (time === timeRestriction) {
          return time;
        } else {
          return time + 1;
        }
      });
    }
  }, [isCalculating, isAuto, timeRestriction]);

  /* 秒表计时 */
  const [autoClock, setAutoClock] = useState<boolean>(false);
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (autoClock) {
      const timer = setInterval(() => {
        setSeconds((prevSeconds) => prevSeconds + 1);
      }, 1000);

      return () => {
        clearInterval(timer);
      };
    }
  }, [autoClock]);
  useEffect(() => {
    const getCurTimeData = (
      time: number,
      nodes: NodePosition[],
      edges: LinkInfo[]
    ) => {
      const handleNodes = (originNodes: NodePosition[]): NodePosition[] => {
        const nodes: NodePosition[] = [];
        originNodes.forEach((originNode) => {
          nodes.push({
            id: originNode.id,
            x: originNode.x,
            y: originNode.y,
            isNew: originNode?.isNew,
          });
        });
        return nodes;
      };
      const handleEdges = (originEdges: LinkInfo[]): any[] => {
        const edges: any[] = [];
        originEdges.forEach((originEdge: LinkInfo) => {
          edges.push({
            id: originEdge.id,
            source: originEdge.source,
            target: originEdge.target,
          });
        });
        return edges;
      };
      return {
        time,
        nodes: handleNodes(nodes),
        edges: handleEdges(edges),
      };
    };
    const curTimeData = getCurTimeData(time, nodes, edges);
    allDataRef.current?.splice(time - 1, 1, curTimeData);
    console.log(
      `算法${algorithm}在该数据集下目前所有时间片的数据为: `,
      allDataRef.current
    );
  }, [time, nodes, edges, algorithm]);
  return (
    <S.GraphContainer className="compare-node-graph">
      <S.LayoutInfoContainer className="layout-info">
        <div className="change-time">
          <Button
            onClick={() =>
              defaultSetTime((time) => {
                if (time === 0) {
                  return time;
                } else {
                  return time - 1;
                }
              })
            }
          >
            &lt;
          </Button>
          <Button
            onClick={() => {
              defaultSetTime((time) => {
                if (time === timeRestriction) {
                  // 达到最大时间片上限之后停止自动播放
                  setIsAuto(false);
                  return time;
                } else {
                  return time + 1;
                }
              });
            }}
          >
            &gt;
          </Button>
          {!calcMetrics && (
            <Button
              onClick={() => {
                setIsAuto(true);
              }}
            >
              自动运行
            </Button>
          )}
          <Button onClick={downloadCurTimeJsonData}>Download</Button>
        </div>
        {/* <p>
          {isCalculating
            ? 'Calculating...'
            : 'Time Consume: ' +
              (performance.now() - timeUsageRef.current).toFixed(0) +
              'ms'}
        </p> */}
      </S.LayoutInfoContainer>
      <Button
        onClick={() => {
          setIsAuto(true);
          setAutoClock(true);
        }}
      >
        自动运行（秒表计时）
      </Button>
      <S.Title>{algorithm[0]}</S.Title>

      {/* <p>🕙 {time}</p> */}
      <div
        style={{
          lineHeight: 1.5,
          margin: '10px 0',
        }}
      >
        <div
          style={{
            textAlign: 'left',
          }}
        >
          <span>动态图时间片合计: {curDatasetInfo?.sliceNum}个时间片</span>
          &nbsp;&nbsp;
          <span>{`秒表计时: ${seconds} s`}</span>
        </div>
        <div
          style={{
            textAlign: 'left',
          }}
        >
          <span>
            {`动态图当前时间片: ${timeHistory.current.length} (nodes: ${nodes.length}, edges: ${edges.length})`}
          </span>
          &nbsp;&nbsp;
        </div>
      </div>
      <div
        ref={ref}
        // 不显示canvas
        style={{
          display: 'none',
        }}
      ></div>
      <SvgGraph
        id={algorithm[0].replace(/\s+/g, '')}
        nodes={nodes}
        edges={edges}
        styleCfg={config}
      />
      <S.MetricContainer visible={calcMetrics}>
        <Metrics
          energy={energy}
          deltaDir={deltaDir}
          deltaLen={deltaLen}
          deltaOrth={deltaOrth}
          deltaPos={deltaPos}
          DCQ={DCQ}
        />
      </S.MetricContainer>
    </S.GraphContainer>
  );
});
export default CompareNodeGraph;
