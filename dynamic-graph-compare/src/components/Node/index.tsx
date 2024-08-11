import React from 'react';
import { NodeStyle } from '../../config';
type NodeType = {
  cx: number;
  cy: number;
  id: string;
} & NodeStyle;
export default function Node(props: NodeType) {
  return <circle className="svg-item" {...props}></circle>;
}
