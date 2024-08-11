import React, { useEffect, useState } from 'react';
import Graph from '../../components/Graph';
import { LinkInfo } from '../../algorithm/types';
import { StyleCfg } from '../../config';
import { Button } from '@/components';
import html2canvas from 'html2canvas';
import { datasetConfigs } from '@/config/NodeGraphSize';
import { PageProps } from '@/routers';

// type OverviewPropsType = {
//   algorithm: string;
//   datasetName: string;
// };

interface OverviewDatum {
  time: number;
  nodes: Array<{ id: string; x: number; y: number }>;
  edges: Array<{ id: string; source: string; target: string }>;
}
const config: StyleCfg = {
  width: 1400,
  height: 1400,
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
// https://blog.csdn.net/m0_51431448/article/details/130145983
function Overview({ isFullScreen, toggleFullScreen }: PageProps) {
  const algorithm = 'g6';
  const datasetName = datasetConfigs[3].name;
  const [graphData, setGraphData] = useState<OverviewDatum[]>([]);
  // const [graphSrc, setGraphSrc] = useState<string>('');
  useEffect(() => {
    if (algorithm && datasetName) {
      fetch(`./data/${algorithm}/${datasetName}.json`)
        .then((res) => res.json())
        .then((d: any) => {
          setGraphData(d);
        });
    }
  }, [algorithm, datasetName]);
  const downloadGraph = () => {
    // 设置height和window Height属性，防止只下载当前看到的页面，这样就可以下载完整的内容
    const containerElement = document.querySelector('.overview-container');
    html2canvas(containerElement as HTMLElement, {
      allowTaint: true,
      useCORS: true,
      scale: 2,
      height: (containerElement as HTMLElement).scrollHeight,
      windowHeight: (containerElement as HTMLElement).scrollHeight,
    }).then((canvas) => {
      // blob
      canvas.toBlob((blob) => {
        const href = window.URL.createObjectURL(new Blob([blob as Blob]));
        const link = document.createElement('a');
        link.href = href;
        link.download = `${datasetName}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }, 'image/png');
      // base64
      // setGraphSrc(canvas.toDataURL());
    });
  };
  return (
    <div
      className="overview"
      style={{
        backgroundColor: 'white',
        padding: 20,
      }}
    >
      <div className="overview-header">
        <h2>Algorithm: {algorithm}</h2>
        <h2>Dataset: {datasetName}</h2>
        <Button onClick={downloadGraph}>Download Graph</Button>
        <Button onClick={toggleFullScreen}>
          {isFullScreen ? '取消全屏' : '全屏'}
        </Button>
      </div>
      <div
        className="overview-container"
        style={{
          width: '100%',
          height: '100%',
          padding: 20,
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'center',
          rowGap: 5,
          columnGap: 5,
        }}
      >
        {graphData.map((datum: OverviewDatum, i: number) => (
          <div
            key={datum.time}
            style={{
              border: '1px solid black',
              margin: 10,
            }}
          >
            {/* <h3>current time: {datum.time}</h3> */}
            <div
              style={{
                lineHeight: 1.5,
                fontSize: 26,
                marginTop: 50,
                marginLeft: 400,
              }}
            >
              <div
                style={{
                  textAlign: 'left',
                }}
              >
                <span>动态图时间片合计: {graphData.length}个时间片</span>
              </div>
              <div
                style={{
                  textAlign: 'left',
                }}
              >
                <span>
                  {`动态图当前时间片: ${datum.time} (nodes: ${datum.nodes.length}, edges: ${datum.edges.length})`}
                </span>
                &nbsp;&nbsp;
              </div>
            </div>
            <Graph
              id={`slice-${datum.time}`}
              nodes={datum.nodes}
              edges={datum.edges as unknown as LinkInfo[]}
              styleCfg={config}
            />
          </div>
        ))}
      </div>
      {/* <img src={graphSrc} alt="copy" /> */}
    </div>
  );
}
export default Overview;
