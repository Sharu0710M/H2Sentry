import React, { useEffect, useState } from 'react';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../services/dataService';
import type { NotificationData } from '../types';
import { Bell, Check, Search, AlertTriangle, Info, HardDrive, ShieldAlert, CheckCircle2 } from 'lucide-react';

export const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');

  const fetchNotifications = async () => {
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      await markNotificationRead(id);
      setNotifications(notifications.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const filteredNotifications = notifications.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(searchTerm.toLowerCase()) || n.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'ALL' || n.type === filterType;
    return matchesSearch && matchesType;
  });

  const getIcon = (type: string) => {
    switch(type) {
      case 'CRITICAL': return <ShieldAlert className="w-5 h-5 text-red-500" />;
      case 'WARNING': return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'DEVICE': return <HardDrive className="w-5 h-5 text-blue-500" />;
      default: return <Info className="w-5 h-5 text-slate-500" />;
    }
  };

  const getBadge = (severity: string) => {
    switch(severity) {
      case 'CRITICAL': return 'bg-red-100 text-red-700';
      case 'HIGH': return 'bg-orange-100 text-orange-700';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Bell className="w-6 h-6 text-brand-primary" /> Notifications & Alerts
          </h1>
          <p className="text-slate-500 text-sm mt-1">Review system alerts, device health, and exposure warnings.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleMarkAllRead} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 shadow-sm">
            <CheckCircle2 className="w-4 h-4" /> Mark All Read
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search alerts..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
          />
        </div>
        <div className="flex bg-white border border-slate-200 rounded-lg p-1 overflow-x-auto">
          {['ALL', 'CRITICAL', 'WARNING', 'DEVICE', 'SYSTEM'].map(t => (
            <button 
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-4 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap transition-colors ${filterType === t ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading && notifications.length === 0 ? (
          <div className="p-12 text-center text-slate-500">Loading notifications...</div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center">
            <Bell className="w-8 h-8 text-slate-300 mb-3" />
            <p className="font-medium">All caught up!</p>
            <p className="text-sm">No notifications match your current filters.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredNotifications.map(notification => (
              <div key={notification._id} className={`p-4 transition-colors hover:bg-slate-50 flex gap-4 ${notification.read ? 'opacity-70 bg-white' : 'bg-slate-50/50'}`}>
                <div className="mt-1">
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className={`font-semibold ${notification.read ? 'text-slate-700' : 'text-slate-900'}`}>
                      {notification.title}
                    </h3>
                    <span className="text-xs text-slate-400 whitespace-nowrap">
                      {new Date(notification.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className={`text-sm ${notification.read ? 'text-slate-500' : 'text-slate-600'}`}>
                    {notification.message}
                  </p>
                  <div className="flex items-center gap-2 pt-2">
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${getBadge(notification.severity)}`}>
                      {notification.severity}
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded uppercase bg-slate-100 text-slate-500 border border-slate-200">
                      {notification.type}
                    </span>
                  </div>
                </div>
                {!notification.read && (
                  <button onClick={() => handleMarkRead(notification._id)} className="w-8 h-8 flex items-center justify-center rounded-full text-brand-primary hover:bg-brand-primary/10 transition-colors" title="Mark as read">
                    <Check className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
