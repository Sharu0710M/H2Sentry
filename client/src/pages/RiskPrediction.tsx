import React, { useEffect, useState } from 'react';
import { getPredictionData } from '../services/dataService';
import type { PredictionData } from '../types';
import { ShieldAlert, Info, ArrowRight, Activity, Clock } from 'lucide-react';

export const RiskPrediction: React.FC = () => {
  const [data, setData] = useState<PredictionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getPredictionData();
        setData(result);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading && !data) {
    return <div className="flex items-center justify-center h-64 text-slate-500">Loading risk advisory data...</div>;
  }

  const getIndicatorColor = (indicator: string) => {
    switch(indicator) {
      case 'CRITICAL': return 'bg-red-100 text-red-700 border-red-200';
      case 'ELEVATED': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'CAUTION': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-teal-100 text-teal-700 border-teal-200';
    }
  };

  const getShiftIcon = (shift: string) => {
    if (shift === 'MORNING') return '🌅';
    if (shift === 'AFTERNOON') return '☀️';
    return '🌙';
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Risk Prediction & Advisory</h1>
        <p className="text-slate-500 text-sm mt-1">Analytical projection based on historical exposure patterns. Not a guaranteed prediction.</p>
      </div>

      {/* Advisory Section */}
      <div className="bg-white rounded-xl shadow-sm border border-l-4 border-l-brand-primary p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-brand-primary/10 rounded-full text-brand-primary">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 mb-2">Shift-wise Safety Advisory</h2>
            <p className="text-slate-600 leading-relaxed max-w-4xl">
              {data?.advisory}
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs font-medium text-slate-400 bg-slate-50 px-3 py-2 rounded-md inline-flex border border-slate-100">
              <Info className="w-4 h-4" />
              This advisory is an analytical projection based on historical data. It does not diagnose, claim exact future concentrations, or represent a regulatory decision.
            </div>
          </div>
        </div>
      </div>

      {/* Visualization Pipeline */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-4 bg-slate-50 p-6 rounded-xl border border-slate-200">
        <div className="bg-white px-6 py-4 rounded-lg shadow-sm border border-slate-200 text-center flex-1 w-full">
          <div className="text-sm font-semibold text-slate-500 mb-1 uppercase tracking-wider">Historical Data</div>
          <div className="text-2xl font-bold text-slate-800">{data?.trend.historicalAverage} ppm avg</div>
        </div>
        <ArrowRight className="w-8 h-8 text-slate-400 hidden md:block" />
        <div className="bg-white px-6 py-4 rounded-lg shadow-sm border border-slate-200 text-center flex-1 w-full">
          <div className="text-sm font-semibold text-slate-500 mb-1 uppercase tracking-wider">Projected Trend</div>
          <div className="text-2xl font-bold text-slate-800">{data?.trend.projectedPattern}</div>
        </div>
        <ArrowRight className="w-8 h-8 text-slate-400 hidden md:block" />
        <div className="bg-white px-6 py-4 rounded-lg shadow-sm border border-slate-200 text-center flex-1 w-full">
          <div className="text-sm font-semibold text-slate-500 mb-1 uppercase tracking-wider">Highest Risk Shift</div>
          <div className="text-2xl font-bold text-slate-800">{data?.highestRiskShift}</div>
        </div>
      </div>

      {/* Shift Analysis Cards */}
      <h2 className="text-lg font-bold text-slate-800 pt-4">Shift-wise Exposure Analysis</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {data?.shifts.map((shift, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <span className="text-xl">{getShiftIcon(shift.shift)}</span>
                <h3 className="font-bold text-slate-800">{shift.shift}</h3>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getIndicatorColor(shift.indicator)}`}>
                {shift.indicator}
              </span>
            </div>
            
            <div className="p-6 space-y-6 flex-1">
              <div>
                <p className="text-sm text-slate-500 mb-1 flex items-center gap-2"><Activity className="w-4 h-4"/> Average H₂S</p>
                <p className="text-2xl font-bold text-slate-800">{shift.averageH2s} <span className="text-sm font-medium text-slate-500">ppm</span></p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <p className="text-xs text-slate-500 mb-1">Peak H₂S</p>
                  <p className="font-bold text-slate-700">{shift.peakH2s} ppm</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <p className="text-xs text-slate-500 mb-1">Exposure Events</p>
                  <p className="font-bold text-slate-700">{shift.events}</p>
                </div>
              </div>
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
              <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> Monitoring Hrs: {shift.monitoringHours}</span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
