import React from 'react';
import './App.css';
import { useRoutes } from 'react-router-dom';
import routes from './routers';

export default function App() {
  const elements = useRoutes(routes);
  return <div className="app">{elements}</div>;
}
