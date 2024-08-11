import React from 'react';
import { S } from './style';
type MetricPropsType = {
  energy: number;
  deltaDir: number;
  deltaLen: number;
  deltaOrth: number;
  deltaPos: number;
  DCQ: number;
};
export default function Metrics({
  energy,
  deltaDir,
  deltaLen,
  deltaOrth,
  deltaPos,
  DCQ,
}: MetricPropsType) {
  return (
    <S.MetricsWrapper>
      <p className="layout-metric-p">布局能量:{energy}</p>
      <p className="layout-metric-p">方向偏移量:{deltaDir}</p>
      <p className="layout-metric-p">边长偏移量:{deltaLen}</p>
      <p className="layout-metric-p">正交距离偏移量:{deltaOrth}</p>
      <p className="layout-metric-p">节点位置偏移量:{deltaPos}</p>
      <p className="layout-metric-p">DCQ:{DCQ}</p>
    </S.MetricsWrapper>
  );
}
