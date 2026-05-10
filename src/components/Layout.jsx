import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout({ stats }) {
  return (
    <div className="app-layout">
      <Sidebar stats={stats} />
      <div className="main-content">
        <Outlet />
      </div>
    </div>
  );
}
