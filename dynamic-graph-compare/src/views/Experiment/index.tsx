import React, { useEffect, useRef, useState } from 'react';
import CompareNodeGraph from '../../components/CompareNodeGraph';
import { Switch, Tooltip, Select } from 'tdesign-react';
import Button from '@/components/Button';
import DynamicGraph from '../../algorithm/DynamicGraph';
import { datasetConfigs } from '../../config/NodeGraphSize';
import useDatasetName from '../../hooks/useDatasetName';
import { S } from './style';
import { compareConfig } from '@/config/compareCfgs';
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

      {/* 呈现对比算法的组件 */}
      <S.CompareAlgContainer className="compare-layout">
        <CompareNodeGraph
          key={compareConfig[2].id}
          data={data}
          algorithm={compareConfig[2].name}
          panelTime={0}
          ref={compareRef}
          calcMetrics={calcMetrics}
        />
      </S.CompareAlgContainer>
    </S.Container>
  );
}

export default Experiment;
