import React from 'react';
import { EdgeStyle } from '../../config';
type EdgeType = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
} & EdgeStyle;
export default function Edge({ x1, y1, x2, y2, ...edgeStyle }: EdgeType) {
  return (
    <path
      className="svg-item"
      d={`M${x1} ${y1} L${x2} ${y2}`}
      {...edgeStyle}
    ></path>
  );
}
