import React, { useEffect, useState } from 'react';
import { getWorkers, getAnalyticsData, getPredictionData } from '../services/dataService';
import { FileText, Download, Filter, Printer, Loader2 } from 'lucide-react';
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export const Reports: React.FC = () => {
  const [workers, setWorkers] = useState<any[]>([]);
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<any>(null);

  useEffect(() => {
    getWorkers().then(setWorkers).catch(console.error);
  }, []);

  const handleGeneratePreview = async () => {
    setLoading(true);
    try {
      const workerId = selectedWorkerId === 'all' ? undefined : selectedWorkerId;
      const [analytics, predictions] = await Promise.all([
        getAnalyticsData(timeRange, workerId),
        getPredictionData(workerId)
      ]);
      
      const worker = selectedWorkerId !== 'all' ? workers.find(w => w.id === selectedWorkerId) : null;
      
      setReportData({
        worker,
        timeRange,
        analytics,
        predictions,
        generatedAt: new Date()
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!reportData) return;
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    
    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(14, 116, 144); // brand primary teal
    doc.text("H2S GUARD", 14, 20);
    
    doc.setFontSize(12);
    doc.setTextColor(100, 116, 139);
    doc.text("H2S Exposure Monitoring & Worker Safety Platform", 14, 28);
    
    doc.setFontSize(10);
    doc.text("SIH26118 Prototype", 14, 34);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`Generated: ${reportData.generatedAt.toLocaleString()}`, pageWidth - 14, 20, { align: 'right' });
    
    // Line separator
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(14, 40, pageWidth - 14, 40);
    
    // Report Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42);
    const title = reportData.worker ? `Individual Worker Exposure Report` : `Comprehensive Facility Report`;
    doc.text(title, 14, 55);
    
    // Details Section
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    let yPos = 65;
    
    if (reportData.worker) {
      doc.text(`Worker Name: ${reportData.worker.name}`, 14, yPos);
      doc.text(`Employee ID: ${reportData.worker.employeeId}`, 14, yPos + 7);
      doc.text(`Department: ${reportData.worker.department}`, 14, yPos + 14);
      yPos += 25;
    }
    doc.text(`Report Period: ${timeRange.charAt(0).toUpperCase() + timeRange.slice(1)}`, 14, yPos);
    
    // Metrics Table
    yPos += 15;
    const m = reportData.analytics.metrics;
    autoTable(doc, {
      startY: yPos,
      head: [['Metric', 'Value', 'Unit']],
      body: [
        ['Average H2S Concentration', m.averageH2s.toString(), 'ppm'],
        ['Peak H2S Detected', m.peakH2s.toString(), 'ppm'],
        ['Exposure Events', m.exposureEvents.toString(), 'events'],
        ['Visual Strip Changes', m.stripChanges.toString(), 'occurrences'],
        ['Average Temperature', m.averageTemperature.toString(), '°C'],
        ['Average Humidity', m.averageHumidity.toString(), '%']
      ],
      theme: 'grid',
      headStyles: { fillColor: [14, 116, 144] },
      styles: { fontSize: 10, cellPadding: 5 }
    });
    
    // Risk Advisory Section
    yPos = (doc as any).lastAutoTable.finalY + 15;
    
    if (yPos > 250) { doc.addPage(); yPos = 20; }
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text("Risk Prediction & Advisory", 14, yPos);
    
    yPos += 10;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text("Analytical projection based on historical exposure patterns. Not a guaranteed medical diagnosis.", 14, yPos);
    
    yPos += 10;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(249, 115, 22); // orange
    doc.text("Advisory Note:", 14, yPos);
    
    yPos += 7;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(15, 23, 42);
    
    // Word wrap advisory text
    const splitAdvisory = doc.splitTextToSize(reportData.predictions.advisory, pageWidth - 28);
    doc.text(splitAdvisory, 14, yPos);
    
    // Save
    doc.save(`H2S_GUARD_Report_${reportData.worker ? reportData.worker.employeeId : 'Facility'}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <FileText className="w-6 h-6 text-brand-primary" /> Reports Generation
        </h1>
        <p className="text-slate-500 text-sm mt-1">Generate and export institutional safety reports in PDF format.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row gap-6 items-end">
        <div className="flex-1 space-y-1">
          <label className="text-xs font-semibold text-slate-500 uppercase">Target Entity</label>
          <select 
            value={selectedWorkerId} 
            onChange={e => setSelectedWorkerId(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
          >
            <option value="all">Entire Facility (All Workers)</option>
            {workers.map(w => (
              <option key={w.id} value={w.id}>{w.name} ({w.employeeId})</option>
            ))}
          </select>
        </div>
        
        <div className="flex-1 space-y-1">
          <label className="text-xs font-semibold text-slate-500 uppercase">Report Period</label>
          <select 
            value={timeRange} 
            onChange={e => setTimeRange(e.target.value as any)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
          >
            <option value="daily">Daily Report (Last 24 Hours)</option>
            <option value="weekly">Weekly Report (Last 7 Days)</option>
            <option value="monthly">Monthly Report (Last 30 Days)</option>
          </select>
        </div>

        <button 
          onClick={handleGeneratePreview}
          disabled={loading}
          className="px-6 py-2.5 bg-brand-primary text-white text-sm font-semibold rounded-lg hover:bg-brand-secondary transition-colors shadow-sm flex items-center gap-2 h-[42px]"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Filter className="w-4 h-4" />} 
          Generate Preview
        </button>
      </div>

      {reportData && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="font-bold text-slate-800 flex items-center gap-2"><Printer className="w-5 h-5 text-slate-400" /> Report Preview</h2>
            <button 
              onClick={handleDownloadPDF}
              className="px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-colors shadow-sm flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> Download PDF
            </button>
          </div>
          
          <div className="p-8 font-sans max-w-4xl mx-auto">
            {/* Report Content Preview */}
            <div className="border-b-2 border-slate-200 pb-6 mb-6">
              <h1 className="text-3xl font-bold text-brand-primary">H₂S GUARD</h1>
              <p className="text-slate-500 font-medium">H₂S Exposure Monitoring & Worker Safety Platform</p>
              <p className="text-xs text-slate-400 mt-1">SIH26118 Prototype</p>
              <p className="text-xs text-slate-500 mt-4 text-right">Generated: {reportData.generatedAt.toLocaleString()}</p>
            </div>

            <h2 className="text-xl font-bold text-slate-800 mb-4">
              {reportData.worker ? 'Individual Worker Exposure Report' : 'Comprehensive Facility Report'}
            </h2>
            
            {reportData.worker && (
              <div className="grid grid-cols-2 gap-4 mb-6 bg-slate-50 p-4 rounded-lg border border-slate-100 text-sm">
                <p><span className="text-slate-500 w-24 inline-block">Worker Name:</span> <span className="font-semibold text-slate-800">{reportData.worker.name}</span></p>
                <p><span className="text-slate-500 w-24 inline-block">Department:</span> <span className="font-semibold text-slate-800">{reportData.worker.department}</span></p>
                <p><span className="text-slate-500 w-24 inline-block">Employee ID:</span> <span className="font-mono text-slate-800">{reportData.worker.employeeId}</span></p>
                <p><span className="text-slate-500 w-24 inline-block">Report Period:</span> <span className="capitalize font-semibold text-slate-800">{reportData.timeRange}</span></p>
              </div>
            )}

            <div className="mb-8">
              <h3 className="font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4">Key Metrics Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-4 bg-white border border-slate-200 rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">Avg H₂S</p>
                  <p className="text-xl font-bold text-teal-700">{reportData.analytics.metrics.averageH2s} ppm</p>
                </div>
                <div className="p-4 bg-white border border-slate-200 rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">Peak H₂S</p>
                  <p className="text-xl font-bold text-orange-700">{reportData.analytics.metrics.peakH2s} ppm</p>
                </div>
                <div className="p-4 bg-white border border-slate-200 rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">Exposure Events</p>
                  <p className="text-xl font-bold text-red-700">{reportData.analytics.metrics.exposureEvents}</p>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4">Risk Prediction & Advisory</h3>
              <p className="text-xs text-slate-400 italic mb-4">Analytical projection based on historical exposure patterns. Not a guaranteed medical diagnosis.</p>
              <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-lg text-sm text-slate-700">
                <span className="font-bold text-orange-800 block mb-1">Advisory Note:</span>
                {reportData.predictions.advisory}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
