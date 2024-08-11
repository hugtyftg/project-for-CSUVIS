import { createContext, useContext } from 'react';
import GraphStore from './GraphStore';

class RootStore {
  public graphStore: GraphStore;
  constructor() {
    this.graphStore = new GraphStore();
  }
}
const rootStore = new RootStore();
const context = createContext(rootStore);
const useStore = () => useContext(context);
export { useStore };
