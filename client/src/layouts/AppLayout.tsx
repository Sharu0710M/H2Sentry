import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Topbar } from '../components/Topbar';
import { MobileNav } from '../components/MobileNav';

export const AppLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-brand-light pb-16 md:pb-0">
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <div className="flex-1 md:ml-64 flex flex-col w-full min-w-0">
        <Topbar />
        <main className="flex-1 p-4 md:p-6 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
      <MobileNav />
    </div>
  );
};
