import { makeAutoObservable } from 'mobx';
import { GraphInfo } from '../algorithm/types';
const initTime: number = 0;
const initData: GraphInfo = {
  nodes: [],
  edges: [],
};
class GraphStore {
  // 目前已经累计的所有位置信息
  protected allData: Map<number, GraphInfo>;
  // 当前时间片的节点位置信息
  protected data: GraphInfo;
  // 当前所处时间片
  protected currentTime: number;
  // 当前动态图的最大时间片
  protected maxTime: number;
  constructor() {
    this.allData = new Map();
    this.allData.set(initTime, initData);
    this.data = initData;
    this.currentTime = initTime;
    this.maxTime = initTime;
    makeAutoObservable(this, {}, { autoBind: true });
  }
  updateData(newData: GraphInfo) {
    // 类似setXXX的浅比较
    if (!Object.is(this.data, newData)) {
      this.data = newData;
    }
  }
  updateAllData(newTime: number, newData: GraphInfo) {
    this.allData.set(newTime, newData);
  }
  updateCurMaxTime(newMaxTime: number) {
    this.maxTime = newMaxTime;
  }
  updateCurTime(increment: number) {
    this.currentTime += increment;
  }
  resetAllData() {
    this.allData.clear();
  }
  resetData() {
    this.data = initData;
  }
  resetCurrentTime() {
    this.currentTime = 0;
  }
  resetMaxTime() {
    this.maxTime = 0;
  }
  get curAllData() {
    return this.allData;
  }
  getDataAtTime(time: number) {
    return this.allData.get(time);
  }
  get curData() {
    return this.data;
  }
  get isCurNodesEmpty() {
    return this.data.nodes.length === 0;
  }
  get curTime() {
    return this.currentTime;
  }
  get curMaxTime() {
    return this.maxTime;
  }
}
export default GraphStore;
