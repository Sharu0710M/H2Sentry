import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Activity, Cpu, ShieldCheck, Database, ArrowRight } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-brand-light font-sans text-slate-800">
      {/* Header */}
      <header className="bg-brand-dark text-white px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <ShieldAlert className="w-8 h-8 text-brand-accent" />
          <div>
            <h1 className="font-bold text-xl tracking-wider">H₂S GUARD</h1>
          </div>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => navigate('/login')}
            className="px-4 py-2 text-sm font-medium hover:text-brand-accent transition-colors"
          >
            Login
          </button>
          <button 
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 text-sm font-medium bg-brand-accent hover:bg-teal-500 rounded-lg transition-colors"
          >
            Go to App
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-8 py-24 bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold text-brand-primary mb-6 leading-tight">
            H₂S Exposure Monitoring &<br/>
            <span className="text-brand-accent">Worker Safety Platform</span>
          </h2>
          <p className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto">
            A digital monitoring platform designed to support worker exposure monitoring, sensor-based safety awareness, visual strip observation, analytics and safety advisories.
          </p>
          <div className="flex justify-center gap-4">
            <button 
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 px-6 py-3 bg-brand-primary text-white font-medium rounded-lg hover:bg-slate-700 transition-colors"
            >
              Get Started <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Architecture Flow Section */}
      <section className="px-8 py-20 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-2xl font-bold text-brand-primary mb-4">Hardware + IoT Architecture</h3>
            <p className="text-slate-600">Conceptual data flow for PHASE 1 & beyond</p>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-8 text-center relative">
            <div className="flex-1">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center mx-auto mb-4">
                <Cpu className="w-8 h-8 text-slate-700" />
              </div>
              <h4 className="font-semibold mb-2">Sensors</h4>
              <p className="text-sm text-slate-500">MQ-136, ESP32-CAM</p>
            </div>
            
            <div className="hidden md:block w-8 h-0.5 bg-slate-300"></div>

            <div className="flex-1">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center mx-auto mb-4">
                <Activity className="w-8 h-8 text-brand-accent" />
              </div>
              <h4 className="font-semibold mb-2">IoT Gateway</h4>
              <p className="text-sm text-slate-500">Blynk / Data Service</p>
            </div>

            <div className="hidden md:block w-8 h-0.5 bg-slate-300"></div>

            <div className="flex-1">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center mx-auto mb-4">
                <Database className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="font-semibold mb-2">Data Platform</h4>
              <p className="text-sm text-slate-500">Node.js & MongoDB</p>
            </div>

            <div className="hidden md:block w-8 h-0.5 bg-slate-300"></div>

            <div className="flex-1">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-8 h-8 text-safety-normal" />
              </div>
              <h4 className="font-semibold mb-2">Safety Advisory</h4>
              <p className="text-sm text-slate-500">Analytics & Alerts</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-brand-dark text-slate-400 py-8 text-center text-sm border-t border-slate-800">
        <p>© 2026 H₂S GUARD Platform. SIH26118 Project.</p>
        <p className="mt-2 text-xs">For demonstration purposes only.</p>
      </footer>
    </div>
  );
};
