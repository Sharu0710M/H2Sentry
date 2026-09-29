import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, Activity, BarChart2, AlertTriangle, Users, Bell, 
  FileText, User, Settings, ShieldAlert, LogOut
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavItems = () => {
    const role = user?.role || 'WORKER';
    const items = [
      { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'SAFETY_OFFICER', 'WORKER'] },
      { name: 'Live Monitoring', path: '/monitoring', icon: Activity, roles: ['ADMIN', 'SAFETY_OFFICER', 'WORKER'] },
      { name: 'Analytics', path: '/analytics', icon: BarChart2, roles: ['ADMIN', 'SAFETY_OFFICER', 'WORKER'] },
      { name: 'Risk Prediction', path: '/risk', icon: AlertTriangle, roles: ['ADMIN', 'SAFETY_OFFICER'] },
      { name: 'Workers', path: '/workers', icon: Users, roles: ['ADMIN', 'SAFETY_OFFICER'] },
      { name: 'Notifications', path: '/notifications', icon: Bell, roles: ['ADMIN', 'SAFETY_OFFICER', 'WORKER'] },
      { name: 'Reports', path: '/reports', icon: FileText, roles: ['ADMIN', 'SAFETY_OFFICER', 'WORKER'] },
    ];
    return items.filter(item => item.roles.includes(role));
  };

  const navItems = getNavItems();

  return (
    <div className="flex flex-col w-64 bg-brand-dark text-slate-300 h-screen fixed left-0 top-0 border-r border-slate-800">
      <div className="flex items-center gap-3 px-6 py-6 border-b border-slate-800 text-white">
        <ShieldAlert className="w-8 h-8 text-brand-accent" />
        <div>
          <h1 className="font-bold text-lg tracking-wider">H₂S GUARD</h1>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest">Safety Platform</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {navItems.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                    isActive 
                      ? "bg-brand-primary text-brand-accent font-medium" 
                      : "hover:bg-slate-800/50 hover:text-white"
                  )
                }
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-slate-800">
        <ul className="space-y-1 px-3 mb-4">
          <li>
            <NavLink to="/profile" className={({ isActive }) => cn("flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm", isActive ? "bg-brand-primary text-brand-accent font-medium" : "hover:bg-slate-800/50 hover:text-white")}>
              <User className="w-4 h-4" /> Profile
            </NavLink>
          </li>
          {user?.role === 'ADMIN' && (
            <li>
              <NavLink to="/settings" className={({ isActive }) => cn("flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm", isActive ? "bg-brand-primary text-brand-accent font-medium" : "hover:bg-slate-800/50 hover:text-white")}>
                <Settings className="w-4 h-4" /> Settings
              </NavLink>
            </li>
          )}
          <li>
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </li>
        </ul>
        <div className="px-4 py-3 bg-slate-900/50 rounded-lg border border-slate-800">
          <p className="text-xs text-slate-400 mb-1">System Status</p>
          <div className="flex items-center gap-2 text-sm text-safety-normal">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-safety-normal opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-safety-normal"></span>
            </span>
            Demo Mode Active
          </div>
        </div>
      </div>
    </div>
  );
};
