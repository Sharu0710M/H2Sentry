import React, { useEffect, useState } from 'react';
import { getMonitoringData, getImageHistory, captureSnapshot } from '../services/dataService';
import type { MonitoringData, StripImageData } from '../types';
import { Activity, Thermometer, Droplets, Camera, Clock, Info } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export const Monitoring: React.FC = () => {
  const [data, setData] = useState<MonitoringData | null>(null);
  const [history, setHistory] = useState<StripImageData[]>([]);
  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h'>('24h');
  const [streamIp, setStreamIp] = useState('10.210.110.153');
  const [isStreaming, setIsStreaming] = useState(false);
  const [loading, setLoading] = useState(true);
  const [capturing, setCapturing] = useState(false);

  const fetchData = async () => {
    try {
      const [monData, histData] = await Promise.all([
        getMonitoringData(timeRange),
        getImageHistory()
      ]);
      setData(monData);
      setHistory(histData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCapture = async () => {
    try {
      setCapturing(true);
      await captureSnapshot(streamIp);
      await fetchData(); // reload data
    } catch (err) {
      console.error(err);
      alert('Capture failed. Make sure streamIp is correct.');
    } finally {
      setCapturing(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [timeRange]);

  if (loading && !data) {
    return <div className="flex items-center justify-center h-64 text-slate-500">Loading monitoring data...</div>;
  }

  const getStatusColor = (h2s: number) => {
    if (h2s > 15) return 'text-safety-critical';
    if (h2s > 10) return 'text-safety-elevated';
    if (h2s > 5) return 'text-safety-caution';
    return 'text-safety-normal';
  };

  const getBadgeClass = (classification: string) => {
    switch (classification) {
      case 'HIGH': return 'bg-red-100 text-red-700';
      case 'MODERATE': return 'bg-orange-100 text-orange-700';
      case 'SLIGHT': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-teal-100 text-teal-700';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Live Monitoring</h1>
        <p className="text-slate-500 text-sm mt-1">Real-time sensor feeds, prototype thresholds, and visual strip analysis.</p>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-500 flex items-center gap-2"><Activity className="w-4 h-4"/> Current H₂S</h3>
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${data?.current?.h2s && data.current.h2s > 15 ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
              Threshold: {data?.thresholds.critical} ppm
            </span>
          </div>
          <div className={`text-3xl font-bold ${data?.current?.h2s ? getStatusColor(data.current.h2s) : 'text-slate-800'}`}>
            {data?.current?.h2s || '--'} <span className="text-lg font-medium text-slate-500">ppm</span>
          </div>
          <p className="text-xs text-slate-400 mt-2 flex items-center gap-1"><Clock className="w-3 h-3"/> Last updated: {data?.current?.timestamp ? new Date(data.current.timestamp).toLocaleTimeString() : '--'}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-sm font-medium text-slate-500 mb-4 flex items-center gap-2"><Thermometer className="w-4 h-4"/> Temperature</h3>
          <div className="text-3xl font-bold text-slate-800">{data?.current?.temperature || '--'} <span className="text-lg font-medium text-slate-500">°C</span></div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-sm font-medium text-slate-500 mb-4 flex items-center gap-2"><Droplets className="w-4 h-4"/> Humidity</h3>
          <div className="text-3xl font-bold text-slate-800">{data?.current?.humidity || '--'} <span className="text-lg font-medium text-slate-500">%</span></div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-sm font-medium text-slate-500 mb-4 flex items-center gap-2"><Info className="w-4 h-4"/> Device Status</h3>
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${data?.device?.status === 'ONLINE' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            <div className="text-xl font-bold text-slate-800">{data?.device?.status || 'OFFLINE'}</div>
          </div>
          <p className="text-xs text-slate-400 mt-2">Source: {data?.device?.dataSource?.toUpperCase() || 'BLYNK'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Graph */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-slate-800">H₂S Concentration Timeline</h3>
            <div className="flex bg-slate-100 p-1 rounded-lg">
              {(['1h', '6h', '24h'] as const).map(t => (
                <button 
                  key={t}
                  onClick={() => setTimeRange(t)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${timeRange === t ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.trend || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} domain={[0, 'dataMax + 5']} />
                <Tooltip contentStyle={{ borderRadius: '8px' }} />
                <ReferenceLine y={data?.thresholds.caution} stroke="#eab308" strokeDasharray="3 3" label={{ position: 'top', value: 'Caution Prototype Limit', fill: '#eab308', fontSize: 12 }} />
                <ReferenceLine y={data?.thresholds.critical} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'top', value: 'Critical Prototype Limit', fill: '#ef4444', fontSize: 12 }} />
                <Line type="monotone" dataKey="h2s" stroke="#0ea5e9" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Camera / Strip Analysis */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col">
          <h3 className="font-semibold text-slate-800 mb-2 flex items-center justify-between">
            <span className="flex items-center gap-2"><Camera className="w-5 h-5"/> Visual Strip Classification</span>
            <button 
              onClick={() => setIsStreaming(!isStreaming)}
              className={`text-xs px-2 py-1 rounded font-medium border ${isStreaming ? 'bg-red-50 text-red-600 border-red-200' : 'bg-brand-primary/10 text-brand-primary border-brand-primary/20'}`}
            >
              {isStreaming ? 'Stop Stream' : 'Live Stream'}
            </button>
          </h3>
          <p className="text-xs text-slate-500 mb-2">Latest observation from ESP32-CAM module.</p>
          
          {isStreaming && (
            <div className="flex items-center gap-2 mb-4">
              <input 
                type="text" 
                value={streamIp} 
                onChange={(e) => setStreamIp(e.target.value)}
                placeholder="http://10.210.110.153:81/stream"
                className="flex-1 text-xs px-2 py-1 border border-slate-200 rounded"
              />
              <button
                onClick={handleCapture}
                disabled={capturing || !streamIp}
                className="text-xs px-3 py-1 bg-brand-primary text-white rounded font-medium disabled:opacity-50"
              >
                {capturing ? 'Capturing...' : 'Capture Snapshot'}
              </button>
            </div>
          )}

          <div className="flex-1 bg-slate-50 rounded-lg border border-slate-200 flex flex-col items-center justify-center p-4 mb-4 relative overflow-hidden">
             {isStreaming ? (
               <div className="w-full h-48 bg-slate-800 rounded flex items-center justify-center border border-slate-300 relative shadow-inner overflow-hidden group">
                 {streamIp ? (
                   <img 
                     src={streamIp.startsWith('http') ? streamIp : `http://${streamIp}:81/stream`} 
                     className="w-full h-full object-cover" 
                     alt="Live ESP32-CAM Feed" 
                   />
                 ) : (
                   <span className="text-slate-500 text-xs">Enter Stream URL above</span>
                 )}
                 <div className="absolute top-2 left-2 flex items-center gap-2 bg-black/50 px-2 py-1 rounded text-[10px] text-white">
                   <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div> LIVE
                 </div>
                 {streamIp && (
                   <a 
                     href={streamIp.startsWith('http') ? streamIp : `http://${streamIp}:81/stream`} 
                     target="_blank" 
                     rel="noreferrer"
                     className="absolute bottom-2 right-2 bg-black/70 hover:bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                   >
                     Test Link
                   </a>
                 )}
               </div>
             ) : (
               <div className="w-full h-32 bg-slate-200 rounded flex items-center justify-center border border-slate-300 relative shadow-inner">
                 {data?.latestImage?.classification === 'HIGH' ? (
                   <div className="w-20 h-6 bg-slate-800 shadow-sm border border-slate-600 rounded-sm"></div>
                 ) : data?.latestImage?.classification === 'MODERATE' ? (
                   <div className="w-20 h-6 bg-[#654321] shadow-sm border border-[#4a3118] rounded-sm"></div>
                 ) : data?.latestImage?.classification === 'SLIGHT' ? (
                   <div className="w-20 h-6 bg-[#d2b48c] shadow-sm border border-[#c2a278] rounded-sm"></div>
                 ) : (
                   <div className="w-20 h-6 bg-white shadow-sm border border-slate-300 rounded-sm"></div>
                 )}
                 <div className="absolute bottom-2 right-2 text-[10px] text-slate-400 bg-white/80 px-1 rounded">Camera Mock</div>
               </div>
             )}
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <span className="text-slate-500">Status</span>
              <span className={`px-2 py-0.5 rounded text-xs font-bold ${getBadgeClass(data?.latestImage?.classification || 'NORMAL')}`}>
                {data?.latestImage?.classification || 'UNKNOWN'}
              </span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <span className="text-slate-500">Detected Colour</span>
              <span className="font-medium text-slate-800">{data?.latestImage?.detectedColor || '--'}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <span className="text-slate-500">AI Confidence</span>
              <span className="font-medium text-slate-800">{data?.latestImage?.confidence || '--'}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Timestamp</span>
              <span className="text-slate-800">{data?.latestImage?.capturedAt ? new Date(data.latestImage.capturedAt).toLocaleTimeString() : '--'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="font-semibold text-slate-800">Sensor & Strip Correlation History</h3>
          <p className="text-xs text-slate-500 mt-1">Comparing visual observations with digital gas readings.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-medium">
              <tr>
                <th className="px-6 py-3 border-b border-slate-200">Snapshot</th>
                <th className="px-6 py-3 border-b border-slate-200">Date / Time</th>
                <th className="px-6 py-3 border-b border-slate-200">Strip Classification</th>
                <th className="px-6 py-3 border-b border-slate-200">Detected Colour</th>
                <th className="px-6 py-3 border-b border-slate-200">Model Confidence</th>
                <th className="px-6 py-3 border-b border-slate-200">Associated H₂S</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {history.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">No image history available.</td>
                </tr>
              ) : (
                history.map((item: any) => (
                  <tr key={item.id || item._id} className="hover:bg-slate-50">
                    <td className="px-6 py-2">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt="Snapshot" className="w-16 h-12 object-cover rounded border border-slate-200" />
                      ) : (
                        <div className="w-16 h-12 bg-slate-100 rounded border border-slate-200 flex items-center justify-center text-[10px] text-slate-400">No Img</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(item.capturedAt).toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getBadgeClass(item.classification)}`}>
                        {item.classification}
                      </span>
                    </td>
                    <td className="px-6 py-4">{item.detectedColor}</td>
                    <td className="px-6 py-4">{item.confidence}%</td>
                    <td className="px-6 py-4 font-medium">
                      <span className={getStatusColor(item.associatedH2s || 0)}>
                        {item.associatedH2s} ppm
                      </span>
                    </td>
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
