import React from 'react';
import { Bell, Search, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Topbar: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <button className="p-2 hover:bg-slate-100 rounded-md lg:hidden">
          <Menu className="w-5 h-5 text-slate-600" />
        </button>
        <div className="relative hidden sm:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search workers, alerts..." 
            className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent w-64"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 hover:bg-slate-100 rounded-full text-slate-600">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-safety-elevated rounded-full border-2 border-white"></span>
        </button>
        <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center text-white font-medium text-sm">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-slate-700">{user?.name || 'Guest'}</p>
            <p className="text-xs text-slate-500">{user?.role?.replace('_', ' ') || 'User'}</p>
          </div>
        </div>
      </div>
    </header>
  );
};
