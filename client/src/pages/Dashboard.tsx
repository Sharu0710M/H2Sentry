import React, { useEffect, useState } from 'react';
import { MetricCard } from '../components/MetricCard';
import { Activity, Thermometer, Droplets, Users, Cpu, AlertTriangle } from 'lucide-react';
import { getDashboardData } from '../services/dataService';
import type { DashboardData } from '../types';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

export const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const result = await getDashboardData();
      setData(result);
    } catch (err) {
      console.error('Failed to fetch dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, []);

  if (loading && !data) {
    return <div className="flex items-center justify-center h-64 text-slate-500">Loading dashboard data...</div>;
  }

  const m = data?.metrics;

  const getStatusColor = (h2s: number) => {
    if (h2s > 15) return 'text-safety-critical bg-safety-critical/10';
    if (h2s > 10) return 'text-safety-elevated bg-safety-elevated/10';
    if (h2s > 5) return 'text-safety-caution bg-safety-caution/10';
    return 'text-brand-accent bg-brand-accent/10';
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Safety Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Overview of current H₂S exposure and environmental conditions.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-4 py-2 bg-slate-100 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-safety-normal animate-pulse"></span>
            DATA SOURCE: {data?.dataSource?.toUpperCase() || 'MOCK DATA'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard 
          title="Current H₂S Level" 
          value={m ? `${m.currentH2S} ppm` : '--'} 
          icon={Activity} 
          colorClass={m ? getStatusColor(m.currentH2S) : ''}
        />
        <MetricCard 
          title="Temperature" 
          value={m ? `${m.temperature}°C` : '--'} 
          icon={Thermometer} 
        />
        <MetricCard 
          title="Humidity" 
          value={m ? `${m.humidity}%` : '--'} 
          icon={Droplets} 
        />
        <MetricCard 
          title="Today's Events" 
          value={m ? m.todaysEvents : '--'} 
          icon={AlertTriangle} 
          colorClass={m?.todaysEvents ? "text-safety-critical bg-safety-critical/10" : "text-slate-400 bg-slate-100"}
        />
        <MetricCard 
          title="Active Devices" 
          value={m ? m.activeDevices : '--'} 
          icon={Cpu} 
        />
        <MetricCard 
          title="Workers in Field" 
          value={m ? m.activeWorkers : '--'} 
          icon={Users} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-800 mb-6">H₂S Exposure Trend (24h)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.trend || []}>
                <defs>
                  <linearGradient id="colorH2s" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value} ppm`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ color: '#64748b', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="h2s" stroke="#0d9488" strokeWidth={3} fillOpacity={1} fill="url(#colorH2s)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col">
          <h3 className="font-semibold text-slate-800 mb-4">Latest Strip Image</h3>
          <div className="flex-1 bg-slate-100 rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-center p-6 relative overflow-hidden">
            {m && m.currentH2S > 15 ? (
              <div className="absolute inset-0 bg-safety-critical/20 flex items-center justify-center">
                <span className="text-safety-critical font-bold text-lg rotate-12 bg-white px-3 py-1 rounded shadow-sm">BLACKENED STRIP</span>
              </div>
            ) : m && m.currentH2S > 10 ? (
              <div className="absolute inset-0 bg-safety-elevated/20 flex items-center justify-center">
                <span className="text-safety-elevated font-bold text-lg rotate-12 bg-white px-3 py-1 rounded shadow-sm">BROWN STRIP</span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-16 h-8 bg-white shadow-sm border border-slate-200 rounded-sm mb-3"></div>
                <p className="text-sm text-slate-500">Camera Feed Placeholder</p>
                <p className="text-xs text-slate-400 mt-1">Normal White Strip</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
          <h3 className="font-semibold text-slate-800">Recent Exposure Events</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-medium">
              <tr>
                <th className="px-6 py-3 border-b border-slate-200">Worker</th>
                <th className="px-6 py-3 border-b border-slate-200">Severity</th>
                <th className="px-6 py-3 border-b border-slate-200">H₂S Level</th>
                <th className="px-6 py-3 border-b border-slate-200">Duration</th>
                <th className="px-6 py-3 border-b border-slate-200">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data?.recentEvents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                    No recent exposure events.
                  </td>
                </tr>
              ) : (
                data?.recentEvents.map((event) => (
                  <tr key={event.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-800">{event.workerName}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold
                        ${event.severity === 'CRITICAL' ? 'bg-red-100 text-red-700' : 
                          event.severity === 'ELEVATED' ? 'bg-orange-100 text-orange-700' : 
                          'bg-yellow-100 text-yellow-700'}`}>
                        {event.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4">{event.h2s} ppm</td>
                    <td className="px-6 py-4">{event.duration}s</td>
                    <td className="px-6 py-4 text-slate-500">{new Date(event.time).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
