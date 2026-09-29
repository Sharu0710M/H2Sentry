import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getWorkerById, getAnalyticsData, getPredictionData, getImageHistory } from '../services/dataService';
import { ArrowLeft, Activity, AlertTriangle, ShieldCheck, Camera } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { AnalyticsData, PredictionData, StripImageData } from '../types';

export const WorkerProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [worker, setWorker] = useState<any>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [prediction, setPrediction] = useState<PredictionData | null>(null);
  const [images, setImages] = useState<StripImageData[]>([]);
  const [timeRange, setTimeRange] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const [wData, aData, pData, iData] = await Promise.all([
          getWorkerById(id),
          getAnalyticsData(timeRange, id),
          getPredictionData(id),
          getImageHistory(id)
        ]);

        const formattedChartData = aData.chartData.map((d: any) => ({
          ...d,
          timeFormatted: timeRange === 'daily' 
            ? new Date(d.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : new Date(d.time).toLocaleDateString()
        }));

        setWorker(wData);
        setAnalytics({ ...aData, chartData: formattedChartData });
        setPrediction(pData);
        setImages(iData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id, timeRange]);

  if (loading || !worker) return <div className="flex justify-center p-12 text-slate-500">Loading worker profile...</div>;

  const m = analytics?.metrics;

  const handleGenerateReport = () => {
    alert(`Generating Comprehensive Exposure Report for ${worker.name}...`);
    // In a real app, this would trigger a PDF generation service on the backend
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/workers')} className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{worker.name}</h1>
            <p className="text-slate-500 text-sm mt-1">{worker.employeeId} • {worker.department || 'General Department'}</p>
          </div>
        </div>
        <button onClick={handleGenerateReport} className="px-4 py-2 bg-brand-primary text-white text-sm font-semibold rounded-lg hover:bg-brand-secondary transition-colors shadow-sm">
          Generate Full Report
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Personal & Device Info */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Personal Information</h3>
            <div className="space-y-2 text-sm text-slate-700">
              <p><span className="text-slate-400 w-24 inline-block">Email:</span> {worker.email}</p>
              <p><span className="text-slate-400 w-24 inline-block">Phone:</span> {worker.phone || '--'}</p>
              <p><span className="text-slate-400 w-24 inline-block">Joined:</span> {new Date(worker.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          <hr className="border-slate-100" />
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Assigned Device</h3>
            {worker.device ? (
              <div className="space-y-2 text-sm text-slate-700">
                <p><span className="text-slate-400 w-24 inline-block">Device ID:</span> <span className="font-mono">{worker.device.deviceId}</span></p>
                <p><span className="text-slate-400 w-24 inline-block">Status:</span> 
                  <span className={`font-semibold ${worker.device.status === 'ONLINE' ? 'text-green-600' : 'text-red-600'}`}>{worker.device.status}</span>
                </p>
                <p><span className="text-slate-400 w-24 inline-block">Last Sync:</span> {new Date(worker.device.lastSeen).toLocaleString()}</p>
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic">No active device assigned to this worker.</p>
            )}
          </div>
        </div>

        {/* Analytics Summary */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-slate-800">Exposure Summary</h3>
            <div className="flex bg-slate-100 p-1 rounded-lg">
              {(['daily', 'weekly', 'monthly'] as const).map(t => (
                <button 
                  key={t}
                  onClick={() => setTimeRange(t)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors capitalize ${timeRange === t ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-teal-50 border border-teal-100 p-4 rounded-lg">
              <p className="text-xs text-teal-600 font-medium mb-1 flex items-center gap-1"><Activity className="w-3 h-3"/> Avg H₂S</p>
              <p className="text-2xl font-bold text-teal-900">{m?.averageH2s} <span className="text-sm font-normal text-teal-700">ppm</span></p>
            </div>
            <div className="bg-orange-50 border border-orange-100 p-4 rounded-lg">
              <p className="text-xs text-orange-600 font-medium mb-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> Peak H₂S</p>
              <p className="text-2xl font-bold text-orange-900">{m?.peakH2s} <span className="text-sm font-normal text-orange-700">ppm</span></p>
            </div>
            <div className="bg-red-50 border border-red-100 p-4 rounded-lg">
              <p className="text-xs text-red-600 font-medium mb-1 flex items-center gap-1"><ShieldCheck className="w-3 h-3"/> Events</p>
              <p className="text-2xl font-bold text-red-900">{m?.exposureEvents}</p>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics?.chartData || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="timeFormatted" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: '8px' }} />
                <Line type="monotone" name="Avg H₂S (ppm)" dataKey="h2s" stroke="#0ea5e9" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Shift Analysis & Camera Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Risk Advisory */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
            <h3 className="font-semibold text-slate-800">Individual Risk Advisory</h3>
          </div>
          <div className="p-6">
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-100 text-orange-800 text-sm mb-6">
              <p className="font-bold mb-1 flex items-center gap-2"><AlertTriangle className="w-4 h-4"/> System Advisory Note</p>
              <p>{prediction?.advisory}</p>
            </div>
            
            <h4 className="text-sm font-bold text-slate-700 mb-3">Shift Breakdown</h4>
            <div className="space-y-3">
              {prediction?.shifts.map(shift => (
                <div key={shift.shift} className="flex items-center justify-between p-3 border border-slate-100 rounded-lg hover:bg-slate-50">
                  <div>
                    <div className="font-bold text-slate-800">{shift.shift}</div>
                    <div className="text-xs text-slate-500">{shift.events} exposure events</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-700">{shift.averageH2s} ppm avg</div>
                    <div className="text-xs font-semibold text-slate-500">{shift.indicator}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Camera History */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-96">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2"><Camera className="w-5 h-5 text-slate-400"/> Camera & Strip Log</h3>
            <span className="text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded font-medium">{images.length} records</span>
          </div>
          <div className="p-0 overflow-y-auto flex-1">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-white sticky top-0 border-b border-slate-100 shadow-sm">
                <tr>
                  <th className="px-6 py-3">Time</th>
                  <th className="px-6 py-3">Observation</th>
                  <th className="px-6 py-3">Linked H₂S</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {images.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-slate-400">No images recorded for this worker's device.</td>
                  </tr>
                ) : images.map(img => (
                  <tr key={img.id} className="hover:bg-slate-50">
                    <td className="px-6 py-3 whitespace-nowrap text-xs">{new Date(img.capturedAt).toLocaleString()}</td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        img.classification === 'HIGH' ? 'bg-red-100 text-red-700' :
                        img.classification === 'MODERATE' ? 'bg-orange-100 text-orange-700' :
                        img.classification === 'SLIGHT' ? 'bg-yellow-100 text-yellow-700' : 'bg-teal-100 text-teal-700'
                      }`}>
                        {img.classification}
                      </span>
                    </td>
                    <td className="px-6 py-3 font-medium">{img.associatedH2s} ppm</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};
