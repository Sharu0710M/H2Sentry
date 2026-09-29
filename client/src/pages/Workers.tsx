import React, { useEffect, useState } from 'react';
import { getWorkers } from '../services/dataService';
import { useNavigate } from 'react-router-dom';
import { Users, Search, Filter, AlertTriangle } from 'lucide-react';

export const Workers: React.FC = () => {
  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const data = await getWorkers();
        setWorkers(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchWorkers();
  }, []);

  const filteredWorkers = workers.filter(w => 
    w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (w.device?.deviceId || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (h2s: number | null) => {
    if (h2s === null) return 'text-slate-400';
    if (h2s > 15) return 'text-red-600 font-bold';
    if (h2s > 10) return 'text-orange-600 font-bold';
    if (h2s > 5) return 'text-yellow-600 font-bold';
    return 'text-teal-600';
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><Users className="w-6 h-6 text-brand-primary"/> Worker Management</h1>
          <p className="text-slate-500 text-sm mt-1">Directory of monitored personnel and real-time exposure status.</p>
        </div>
        
        <div className="flex gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search Name, ID, Device..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 w-64"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">
            <Filter className="w-4 h-4" /> Filters
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading worker directory...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-medium">
                <tr>
                  <th className="px-6 py-4 border-b border-slate-200">Worker</th>
                  <th className="px-6 py-4 border-b border-slate-200">Department / Shift</th>
                  <th className="px-6 py-4 border-b border-slate-200">Device</th>
                  <th className="px-6 py-4 border-b border-slate-200">Current H₂S</th>
                  <th className="px-6 py-4 border-b border-slate-200">Last Updated</th>
                  <th className="px-6 py-4 border-b border-slate-200">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredWorkers.map(worker => (
                  <tr key={worker.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800">{worker.name}</div>
                      <div className="text-xs text-slate-500">{worker.employeeId}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div>{worker.department}</div>
                      <div className="text-xs text-slate-500">{worker.shift}</div>
                    </td>
                    <td className="px-6 py-4">
                      {worker.device ? (
                        <>
                          <div className="font-medium">{worker.device.deviceId}</div>
                          <div className="text-xs flex items-center gap-1">
                            <span className={`w-2 h-2 rounded-full ${worker.device.status === 'ONLINE' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                            {worker.device.status}
                          </div>
                        </>
                      ) : (
                        <span className="text-slate-400 italic">No Device Assigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className={`text-lg ${getStatusColor(worker.currentH2s)}`}>
                        {worker.currentH2s !== null ? `${worker.currentH2s} ppm` : '--'}
                      </div>
                      {worker.currentH2s !== null && worker.currentH2s > 10 && (
                        <div className="text-xs text-orange-600 flex items-center gap-1 mt-1"><AlertTriangle className="w-3 h-3"/> Warning</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs">
                      {worker.lastUpdated ? new Date(worker.lastUpdated).toLocaleString() : '--'}
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => navigate(`/workers/${worker.id}`)}
                        className="px-3 py-1.5 bg-brand-primary text-white text-xs font-semibold rounded hover:bg-brand-secondary transition-colors"
                      >
                        View Profile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredWorkers.length === 0 && (
              <div className="p-8 text-center text-slate-500">No workers found matching your search.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
