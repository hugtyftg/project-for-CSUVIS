// G6图实例配置参数
export const constants = {
  type: 'restricted-force-layout',
  linkDistance: 30,
  nodeStrength: -30,
  preventOverlap: true,
  nodeSize: 5,
  enableTick: true,
  alphaDecay: 1 - Math.pow(0.001, 1 / 150),
  alphaMin: 0.001,
  alpha: 0.3,
};
