import React, { useEffect, useRef, useState } from 'react';
import { NodeGraph } from '../../components';
import { Switch, Tooltip, Select } from 'tdesign-react';
import Button from '@/components/Button';
import DynamicGraph from '../../algorithm/DynamicGraph';
import { datasetConfigs } from '../../config/NodeGraphSize';
import useDatasetName from '../../hooks/useDatasetName';
import { S } from './style';
import { PageProps } from '@/routers';

function Experiment({ isFullScreen, toggleFullScreen }: PageProps) {
  const [datasetName, setDatasetName] = useDatasetName(datasetConfigs[0].name);
  const [data, setData] = useState<any>();
  const [calcMetrics, setCalcMetrics] = useState<boolean>(false);
  const [dynamicGraph, setDynamicGraph] = useState<DynamicGraph>();
  const ourAlgRef = useRef();
  const compareRef = useRef();

  const selectData = (value: any) => {
    setDatasetName(value as any);
  };
  const autoPlayAllAlg = () => {
    (compareRef.current as any).setIsAuto(true);
    (ourAlgRef.current as any).setIsAuto(true);
  };
  const changeMode = () => {
    setCalcMetrics(!calcMetrics);
  };
  useEffect(() => {
    if (datasetName) {
      fetch(`./data/${datasetName}.json`)
        .then((res) => res.json())
        .then((d: any) => {
          setData(d);
        });
    }
  }, [datasetName]);

  useEffect(() => {
    if (data?.nodes && data?.links) {
      setDynamicGraph(new DynamicGraph(data));
    }
  }, [data]);
  return (
    <S.Container className="home">
      <S.TopWrapper>
        {/* 标题 */}
        <S.TitleContainer>
          <h1>Dynamic Graph Drawing Algorithm</h1>
          <h1>Experiment Platform</h1>
        </S.TitleContainer>

        {/* 统一功能区 */}
        <S.FunctionContainer className="common-function">
          <span>
            <Tooltip
              content="该模式不支持自动播放时间片，请慎重！"
              destroyOnClose
              showArrow
              theme="danger"
            >
              计算单时间片指标: &nbsp;
              <Switch size="large" defaultValue={false} onChange={changeMode} />
            </Tooltip>
          </span>
          <Button onClick={toggleFullScreen}>
            {isFullScreen ? '取消全屏' : '全屏'}
          </Button>
          {!calcMetrics && (
            <Button onClick={autoPlayAllAlg}>自动运行所有算法</Button>
          )}
          <div className="select-data">
            <Select
              value={datasetName}
              onChange={selectData}
              autoWidth
              size="large"
              clearable
              placeholder="请选择数据集"
              options={datasetConfigs.map((item) => ({
                label: `${item.name}  (${item.nodesNum}nodes, ${item.edgesNum}edges)`,
                value: item.name,
              }))}
            />
          </div>
        </S.FunctionContainer>
      </S.TopWrapper>

      {/* 呈现我们的动态图布局的组件 */}
      <S.OurAlgContainer>
        <NodeGraph
          dynamicGraph={dynamicGraph}
          datasetName={datasetName}
          ref={ourAlgRef}
          calcMetrics={calcMetrics}
        />
      </S.OurAlgContainer>
    </S.Container>
  );
}

export default Experiment;
