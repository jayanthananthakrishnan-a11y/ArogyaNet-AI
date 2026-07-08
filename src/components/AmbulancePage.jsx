import React, { useState, useEffect } from 'react';
import GlowCard from './ui/GlowCard';
import { Truck, MapPin, Activity, Navigation } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

const AmbulancePage = () => {
  const { t } = useLanguage();
  const [ambulances, setAmbulances] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAmbulances = async () => {
    try {
      const res = await fetch(`/api/inventory/ALL`);
      const json = await res.json();
      setAmbulances(json.transport || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAmbulances();
    const interval = setInterval(fetchAmbulances, 5000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    if (status === 'Available') return 'text-neon-teal bg-neon-teal/20 border-neon-teal/30';
    if (status === 'In-Transit') return 'text-neon-cyan bg-neon-cyan/20 border-neon-cyan/30';
    return 'text-rose-400 bg-rose-500/20 border-rose-500/30';
  };

  const generateMockGPS = (id) => {
    // Generate a pseudo-random but consistent GPS coordinate for demo purposes based on ID
    const baseLat = 28.6139;
    const baseLng = 77.2090;
    const offset1 = (id * 0.01) % 0.05;
    const offset2 = (id * 0.02) % 0.05;
    return `${(baseLat + offset1).toFixed(4)}° N, ${(baseLng + offset2).toFixed(4)}° E`;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10 font-sans">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-widest flex items-center gap-3">
            <Truck className="text-neon-cyan drop-shadow-glow-cyan" />
            {t('ambulance_dispatch')}
          </h2>
          <p className="text-slate-400 text-xs font-mono uppercase tracking-widest mt-1">
            {t('emergency_routing_dispatch_hub')}
          </p>
        </div>
      </div>

      <GlowCard accent="cyan" className="p-0 overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-black/40">
                <th className="p-4 pl-6 text-xs font-bold text-slate-400 uppercase tracking-widest">{t('vehicle_identifier')}</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest">{t('operational_status')}</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest">{t('live_tracking')}</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest">{t('mock_gps')}</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest">{t('fuel_level')}</th>
                <th className="p-4 pr-6 text-xs font-bold text-slate-400 uppercase tracking-widest">{t('driver_contact')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading && ambulances.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-500 font-mono text-sm animate-pulse">
                    {t('scanning_network')}
                  </td>
                </tr>
              ) : ambulances.map(item => (
                <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                  <td className="p-4 pl-6 font-semibold text-slate-200">{item.name}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border text-[10px] font-bold uppercase tracking-wider ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="flex items-center gap-2 text-xs font-bold text-neon-cyan uppercase tracking-widest">
                      <span className="w-2 h-2 rounded-full bg-neon-cyan animate-ping absolute"></span>
                      <span className="w-2 h-2 rounded-full bg-neon-cyan relative"></span>
                      Live
                    </span>
                  </td>
                  <td className="p-4 text-xs text-slate-300 font-mono flex items-center gap-2">
                    <MapPin size={14} className="text-slate-500" />
                    {generateMockGPS(item.id)}
                  </td>
                  <td className="p-4 text-sm text-slate-300 font-mono">{item.fuel_level}</td>
                  <td className="p-4 pr-6 text-sm text-slate-400 font-mono">{item.driver_contact}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlowCard>
    </div>
  );
};

export default AmbulancePage;
