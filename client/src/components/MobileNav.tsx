import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Activity, Bell, FileText } from 'lucide-react';
import { cn } from './Sidebar';

export const MobileNav: React.FC = () => {
  const items = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Monitor', path: '/monitoring', icon: Activity },
    { name: 'Alerts', path: '/notifications', icon: Bell },
    { name: 'Reports', path: '/reports', icon: FileText },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around items-center h-16 px-2 z-50 pb-safe">
      {items.map((item) => (
        <NavLink
          key={item.name}
          to={item.path}
          className={({ isActive }) => cn(
            "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
            isActive ? "text-brand-primary" : "text-slate-500 hover:text-slate-900"
          )}
        >
          <item.icon className="w-5 h-5" />
          <span className="text-[10px] font-medium">{item.name}</span>
        </NavLink>
      ))}
    </div>
  );
};
