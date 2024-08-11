import { StyleCfg } from './styleCfg';

const GRAPH_DEFAULT_CONFIG: StyleCfg = {
  width: 1250,
  height: 1250,
  nodeStyle: {
    fill: 'var(--color-node-new)',
    oldfill: 'var(--color-node-old)',
    r: 1,
    stroke: 'white',
    strokeWidth: 0.2,
    opacity: 1,
  },
  edgeStyle: {
    stroke: 'black',
    strokeWidth: 0.5,
    opacity: 1,
  },
};
export { GRAPH_DEFAULT_CONFIG };
