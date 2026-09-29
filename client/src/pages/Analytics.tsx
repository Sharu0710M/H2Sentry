import React, { useEffect, useState } from 'react';
import { getAnalyticsData } from '../services/dataService';
import type { AnalyticsData } from '../types';
import { Activity, Thermometer, Droplets, ShieldAlert, Clock, AlertTriangle, Camera } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export const Analytics: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await getAnalyticsData(timeRange);
        // Format the time correctly for charts based on timeRange
        const formattedChartData = result.chartData.map((d: any) => ({
          ...d,
          timeFormatted: timeRange === 'daily' 
            ? new Date(d.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : new Date(d.time).toLocaleDateString()
        }));
        setData({ ...result, chartData: formattedChartData });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [timeRange]);

  if (loading && !data) {
    return <div className="flex items-center justify-center h-64 text-slate-500">Loading analytics...</div>;
  }

  const m = data?.metrics;

  const MetricBox = ({ title, value, unit, icon: Icon, color }: any) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 rounded-lg bg-${color}-100 text-${color}-600`}><Icon className="w-5 h-5"/></div>
        <h3 className="text-sm font-medium text-slate-500">{title}</h3>
      </div>
      <div className="text-2xl font-bold text-slate-800">
        {value} <span className="text-sm font-medium text-slate-500">{unit}</span>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Historical Analytics</h1>
          <p className="text-slate-500 text-sm mt-1">Aggregated sensor data, exposure events, and environmental trends.</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
          {(['daily', 'weekly', 'monthly'] as const).map(t => (
            <button 
              key={t}
              onClick={() => setTimeRange(t)}
              className={`px-6 py-2 text-sm font-medium rounded-md transition-colors capitalize ${timeRange === t ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricBox title="Average H₂S" value={m?.averageH2s} unit="ppm" icon={Activity} color="teal" />
        <MetricBox title="Peak H₂S" value={m?.peakH2s} unit="ppm" icon={ShieldAlert} color="red" />
        <MetricBox title="Exposure Events" value={m?.exposureEvents} unit="events" icon={AlertTriangle} color="orange" />
        <MetricBox title="Exposure Duration" value={m?.totalExposureDuration} unit="sec" icon={Clock} color="orange" />
        
        <MetricBox title="Average Temp" value={m?.averageTemperature} unit="°C" icon={Thermometer} color="rose" />
        <MetricBox title="Average Humidity" value={m?.averageHumidity} unit="%" icon={Droplets} color="blue" />
        <MetricBox title="Strip Color Changes" value={m?.stripChanges} unit="times" icon={Camera} color="purple" />
        <MetricBox title="Monitored Time" value={m?.totalMonitoringDuration} unit="hrs" icon={Clock} color="slate" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* H2S Trend Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-800 mb-6">H₂S Concentration Trend</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.chartData || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="timeFormatted" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: '8px' }} />
                <Legend />
                <Line type="monotone" name="Avg H₂S (ppm)" dataKey="h2s" stroke="#0ea5e9" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Exposure Events Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-800 mb-6">Exposure Events Distribution</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.chartData || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="timeFormatted" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: '8px' }} cursor={{ fill: '#f8fafc' }} />
                <Legend />
                <Bar name="Exposure Events" dataKey="events" fill="#f97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Temperature & Humidity Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 lg:col-span-2">
          <h3 className="font-semibold text-slate-800 mb-6">Environmental Conditions</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.chartData || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="timeFormatted" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis yAxisId="left" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis yAxisId="right" orientation="right" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: '8px' }} />
                <Legend />
                <Line yAxisId="left" type="monotone" name="Temperature (°C)" dataKey="temperature" stroke="#f43f5e" strokeWidth={2} dot={false} />
                <Line yAxisId="right" type="monotone" name="Humidity (%)" dataKey="humidity" stroke="#3b82f6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
