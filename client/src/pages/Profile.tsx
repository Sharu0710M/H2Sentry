import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Save, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';

export const Profile: React.FC = () => {
  const { user, token, updateUser } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '', phone: '', department: '', password: '', confirmPassword: ''
  });
  
  const [status, setStatus] = useState<{type: 'error' | 'success', msg: string} | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setFormData(prev => ({
          ...prev,
          name: data.name || '',
          phone: data.phone || '',
          department: data.department || ''
        }));
      } catch (err) {
        console.error('Failed to fetch profile', err);
      }
    };
    if (token) fetchProfile();
  }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    if (formData.password && formData.password !== formData.confirmPassword) {
      return setStatus({ type: 'error', msg: 'Passwords do not match' });
    }

    setLoading(true);
    try {
      const updatePayload: any = {
        name: formData.name,
        phone: formData.phone,
        department: formData.department
      };
      if (formData.password) {
        updatePayload.password = formData.password;
      }

      const { data } = await axios.put('http://localhost:5000/api/auth/profile', updatePayload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      updateUser(data);
      setStatus({ type: 'success', msg: 'Profile updated successfully' });
      setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
    } catch (err: any) {
      setStatus({ type: 'error', msg: err.response?.data?.message || 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">My Profile</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your account settings and credentials.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
        
        {status && (
          <div className={`mb-6 px-4 py-3 rounded-md flex items-center gap-2 text-sm ${status.type === 'error' ? 'bg-red-50 border border-red-200 text-red-600' : 'bg-green-50 border border-green-200 text-green-700'}`}>
            {status.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
            {status.msg}
          </div>
        )}

        <div className="flex items-center gap-4 mb-8 pb-8 border-b border-slate-200">
          <div className="w-16 h-16 bg-brand-primary rounded-full flex items-center justify-center text-white text-xl font-bold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-800">{user?.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-slate-500">{user?.email}</span>
              <span className="px-2 py-0.5 bg-brand-accent/10 text-brand-accent text-xs font-medium rounded-full">
                {user?.role}
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700">Full Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm sm:text-sm focus:ring-brand-accent focus:border-brand-accent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Phone</label>
              <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm sm:text-sm focus:ring-brand-accent focus:border-brand-accent" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700">Department</label>
              <input type="text" name="department" value={formData.department} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm sm:text-sm focus:ring-brand-accent focus:border-brand-accent" />
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200 mt-6">
            <h3 className="text-lg font-medium text-slate-800 mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-slate-400" /> Change Password
            </h3>
            <p className="text-sm text-slate-500 mb-4">Leave blank if you don't want to change your password.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700">New Password</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm sm:text-sm focus:ring-brand-accent focus:border-brand-accent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Confirm New Password</label>
                <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm sm:text-sm focus:ring-brand-accent focus:border-brand-accent" />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button type="submit" disabled={loading} className="flex items-center gap-2 px-6 py-2.5 bg-brand-primary text-white font-medium rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50">
              <Save className="w-4 h-4" />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
