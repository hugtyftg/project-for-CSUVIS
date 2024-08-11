import { isFull, toggle } from '../utils';
import React, { Suspense, useState } from 'react';
import { Navigate } from 'react-router-dom';

export type PageProps = {
  isFullScreen: boolean;
  toggleFullScreen: () => void;
};

type PageWrapperProps = {
  Page: React.FunctionComponent<PageProps>;
};

enum PageType {
  Home = '/home',
  Overview = '/overview',
  Experiment = '/experiment',
  ROOT = '/',
  COMMON = '*',
}

interface Route {
  path: PageType;
  element: React.ReactNode;
  children?: Route[];
}

const OverviewPage: React.LazyExoticComponent<
  React.FunctionComponent<PageProps>
> = React.lazy(() => import('../views/Overview'));
const ExperimentPage: React.LazyExoticComponent<
  React.FunctionComponent<PageProps>
> = React.lazy(() => import('../views/Experiment'));

const PageWrapper = ({ Page }: PageWrapperProps) => {
  /* 是否处于全屏状态 */
  const [isFullScreen, setIsFullScreen] = useState<boolean>(isFull());
  const toggleFullScreen = () => {
    toggle(document.documentElement);
    setIsFullScreen(!isFullScreen);
  };
  return (
    <Suspense fallback={<h1>loading...</h1>}>
      <Page isFullScreen={isFullScreen} toggleFullScreen={toggleFullScreen} />
    </Suspense>
  );
};

const routes: Route[] = [
  {
    path: PageType.Overview,
    element: <PageWrapper Page={OverviewPage} />,
  },
  {
    path: PageType.Experiment,
    element: <PageWrapper Page={ExperimentPage} />,
  },
  {
    path: PageType.ROOT,
    element: <Navigate to={PageType.Experiment} />,
  },
  {
    path: PageType.COMMON,
    element: <Navigate to={PageType.Experiment} />,
  },
];
export default routes;
