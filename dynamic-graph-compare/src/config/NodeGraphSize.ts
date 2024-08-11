export type DatasetConfigType = {
  name: string;
  nodesNum: number;
  edgesNum: number;
  sliceNum: number;
};
export const datasetConfigs: DatasetConfigType[] = [
  {
    name: 'b_19t',
    nodesNum: 955,
    edgesNum: 1334,
    sliceNum: 19,
  },
  {
    name: 'price100_20t',
    nodesNum: 1000,
    edgesNum: 999,
    sliceNum: 20,
  },
  {
    name: 'eva_11t',
    nodesNum: 1072,
    edgesNum: 1249,
    sliceNum: 11,
  },
  {
    name: 'eva_33t',
    nodesNum: 2005,
    edgesNum: 2182,
    sliceNum: 33,
  },
  {
    name: 'bus_10t',
    nodesNum: 1138,
    edgesNum: 1459,
    sliceNum: 10,
  },
];
