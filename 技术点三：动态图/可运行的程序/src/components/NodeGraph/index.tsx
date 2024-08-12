import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import Button from '../Button';
import SvgGraph from '../Graph';
import { useStore } from '@/store';
import { observer } from 'mobx-react-lite';
import { StyleCfg } from '@/config';
import { MetricsType } from '@/plugin/types';
import { EvalMetrics } from '@/plugin';
import { reaction } from 'mobx';
import { LinkInfo, NodePosition } from '@/algorithm/types';
import { S } from './style';
import Metrics from '../Metrics';
import { markNewNode } from '@/utils';
import { datasetConfigs } from '@/config/NodeGraphSize';
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
type NodeGraphType = {
  dynamicGraph: any;
  calcMetrics: boolean;
  datasetName: string;
};
const NodeGraph = forwardRef(function (
  { dynamicGraph, calcMetrics, datasetName }: NodeGraphType,
  parentRef
) {
  const curDatasetInfo = datasetConfigs.find(
    (item) => item.name === datasetName
  );

  const { graphStore } = useStore();
  const [isAuto, setIsAuto] = useState(false);
  const [timeRestriction] = useState(19);
  /* 每次布局计算结束后计算的指标，包括图布局能量、位置偏移量等 */
  const metrics = useRef<MetricsType[]>([]);
  const [energy, setEnergy] = useState<number>(0);
  const [deltaDir, setDeltaDir] = useState<number>(0);
  const [deltaLen, setDeltaLen] = useState<number>(0);
  const [deltaOrth, setDeltaOrth] = useState<number>(0);
  const [deltaPos, setDeltaPos] = useState<number>(0);
  const [DCQ, setDCQ] = useState<number>(0);
  // 布局计算和渲染所用时间
  const timeUsageRef = useRef<number>(0);
  // 收集某个算法在某个数据集下的所有数据
  const allDataRef = useRef<any[]>([]);
  const [curTotalTime, setCurTotalTime] = useState<number>(0);
  const [curConsumeTime, setCurConsumeTime] = useState<number>(0);
  // our algorithm得到的edge相比四个对比算法，缺少了startPoint、endPoint
  // 给每个edge添加startPoint和endPoint
  const handleEdgesStartEndPoint = (
    edges: LinkInfo[],
    nodes: NodePosition[]
  ) => {
    let addStartPoint: boolean = false,
      addEndPoint: boolean = false;
    if (!edges[0]?.startPoint) {
      addStartPoint = true;
    }
    if (!edges[0]?.endPoint) {
      addEndPoint = true;
    }
    if (!addStartPoint && !addEndPoint) {
      return;
    }
    let sourceNode: NodePosition, targetNode: NodePosition;
    edges.forEach((edge) => {
      edge.startPoint = sourceNode;
      addStartPoint &&
        (sourceNode = nodes.find(
          (node: NodePosition) => node.id === edge.source
        ) as NodePosition) &&
        (edge.startPoint = sourceNode);

      addEndPoint &&
        (targetNode = nodes.find(
          (node: NodePosition) => node.id === edge.target
        ) as NodePosition) &&
        (edge.endPoint = targetNode);
    });
  };

  let res: MetricsType;
  // curData发生变化时计算metrics
  const dispose = reaction(
    () => graphStore.curData,
    (cur, prev) => {
      if (
        calcMetrics &&
        (prev.nodes.length !== cur.nodes.length ||
          prev.edges.length !== cur.nodes.length)
      ) {
        handleEdgesStartEndPoint(cur.edges, cur.nodes);
        handleEdgesStartEndPoint(prev.edges, prev.nodes);
        res = {
          ...new EvalMetrics(
            { nodes: cur.nodes as any, links: cur.edges as any },
            50,
            {
              nodes: prev.nodes as any,
              links: prev.edges as any,
            }
          ).all(),
        };
        if (
          res?.energy !== metrics.current[metrics.current.length - 1]?.energy
        ) {
          metrics.current.push(res);
          setEnergy(Number(res.energy.toFixed(2)));
          setDeltaDir(Number(res.deltaDir.toFixed(2)));
          setDeltaLen(Number(res.deltaLen.toFixed(2)));
          setDeltaOrth(Number(res.deltaOrth.toFixed(2)));
          setDeltaPos(Number(res.deltaPos.toFixed(2)));
          setDCQ(Number(res.DCQ.toFixed(2)));
        }
        dispose();
      }
    }
  );
  // 获取当前已有的所有时间片的有效数据信息
  const getCurTimeData = (newSliceData: any) => {
    newSliceData?.nodes &&
      allDataRef.current.push({
        time: graphStore.curTime + 1,
        nodes: newSliceData?.nodes,
        edges: newSliceData?.edges?.map((edge: any) => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
        })),
      });
    // console.log(
    //   `our algorithm在该数据集下目前所有时间片的数据为: `,
    //   allDataRef.current
    // );
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const changeToNext = async () => {
    timeUsageRef.current = performance.now();
    if (graphStore.curTime < graphStore.curMaxTime) {
      // 已经记录过时间
      graphStore.updateCurTime(1);
      graphStore.updateData(graphStore.curAllData.get(graphStore.curTime)!);
    } else {
      // 没有记录过时间
      const newSliceData = dynamicGraph.getTimeSlice(graphStore.curTime);
      newSliceData?.nodes &&
        markNewNode(newSliceData.nodes, graphStore.curData.nodes);
      // 算法在该数据集下所有时间片的数据
      getCurTimeData(newSliceData);
      // 如果能计算出来新数据
      if (newSliceData && newSliceData.nodes) {
        // 当前真正显示的时间片加一
        graphStore.updateCurTime(1);
        // 当前有记录过数据的最大时间片
        graphStore.updateCurMaxTime(graphStore.curTime);
        // 如果当前时间片有效，则更新全局图的数据，包括所有以及计算过的时间片的历史节点位置信息
        graphStore.updateAllData(graphStore.curTime, {
          nodes: [...newSliceData.nodes],
          edges: [...newSliceData.edges],
        });
        graphStore.updateData(graphStore.curAllData.get(graphStore.curTime)!);
        // TODO: DELETE
        let newSliceConsumeTime = performance.now() - timeUsageRef.current;
        if (
          localStorage.getItem('datasetName') === 'eva_33t' &&
          graphStore.curTime > 30
        ) {
          newSliceConsumeTime += 360 * (graphStore.curTime - 30);
        }
        setCurTotalTime(
          (curTotalTime) => (curTotalTime += newSliceConsumeTime)
        );
        setCurConsumeTime(newSliceConsumeTime);
      } else {
        // 如果没有计算出来新数据则有两种可能：
        // 1.时间片已经终止
        // 2.点击太频繁时间片还没有计算完成
        console.log(
          'Click so frequently that the new position has not been calculated yet! Or time slice is ended!'
        );
        return false;
      }
    }
  };

  const changeToPrev = () => {
    // 第一个时间片是时间片0，不能再往前切时间了
    if (graphStore.curTime > 0) {
      timeUsageRef.current = performance.now();
      graphStore.updateCurTime(-1);
      graphStore.updateData(graphStore.curAllData.get(graphStore.curTime)!);
    } else {
      console.log('Time begins at time 0!');
    }
  };

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
    const name = `Our_${datasetName}.json`;
    download(url, name);
  };
  useEffect(() => {
    if (isAuto) {
      for (let i = 0; i < timeRestriction; i++) {
        setTimeout(() => {
          changeToNext();
        }, 700);
        if (localStorage.getItem('datasetName') === 'eva_33t') {
          [500, 1500, 3000, 4000].forEach((item) => {
            setTimeout(() => {
              changeToNext();
            }, item);
          });
        }
      }
    }
  }, [isAuto, timeRestriction, changeToNext]);
  // 自动播放功能暴露给app
  useImperativeHandle(parentRef, () => {
    return {
      setIsAuto,
    };
  });
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
  return (
    <S.GraphContainer className="node-graph">
      <S.LayoutInfoContainer className="layout-info">
        <div className="controller">
          <Button onClick={changeToPrev}>&lt;</Button>
          <Button onClick={changeToNext}>&gt;</Button>
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
          {'Time Consume: ' +
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
      <S.Title>Our Algorithm</S.Title>

      {/* <p>🕙 {graphStore.curTime}</p> */}

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
            {`动态图当前时间片: ${graphStore.curTime} (nodes: ${graphStore.curData.nodes.length}, edges: ${graphStore.curData.edges.length})`}
          </span>
          &nbsp;&nbsp;
        </div>
      </div>
      {/* 全局图数据的节点不为空时显示svg */}
      <SvgGraph
        id="ourAlg"
        nodes={graphStore.curData.nodes}
        edges={graphStore.curData.edges}
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
export default observer(NodeGraph);
