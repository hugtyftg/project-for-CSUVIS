import { LinkInfo, NodeInfo, NodePosition } from '../algorithm/types';
localStorage.setItem('isWorkerCalculating', 'no');

const worker: Worker = new Worker('./worker.js');
function calcNodeWithWorker() {
  let resolver: (result: NodePosition[]) => void;

  worker.onmessage = ({ data }): void => {
    resolver(data);
  };

  return (graphInfo: { node: NodeInfo[]; link: LinkInfo[] }) =>
    new Promise((resolve: (value: NodePosition[]) => void): void => {
      resolver = resolve;
      worker.postMessage(graphInfo);
    });
}

export default calcNodeWithWorker();
