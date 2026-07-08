import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { ShieldAlert, Radio, Activity, AlertTriangle, ShieldCheck } from 'lucide-react';
import GlowCard from './ui/GlowCard';
import { useLanguage } from '../LanguageContext';

const CommandCenterPage = () => {
    const { user } = useAuth();
    const { t } = useLanguage();
    const isAdmin = user?.role === 'admin';
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [broadcastTarget, setBroadcastTarget] = useState('Police Department');
    const [broadcastingId, setBroadcastingId] = useState(null);

    if (!isAdmin) {
        return <div className="text-center py-20 text-rose-500 font-black uppercase tracking-widest">Access Denied</div>;
  }

  const fetchAlerts = async () => {
      setLoading(true);
      try {
          const res = await fetch(`/api/district/alerts`);
          const data = await res.json();
          setAlerts(data);
      } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => {
      fetchAlerts();
  }, []);

  const handleBroadcast = async (alertId) => {
      setBroadcastingId(alertId);
      try {
          await fetch(`/api/district/alerts/broadcast`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ alert_id: alertId, target_agency: broadcastTarget })
          });
          await fetchAlerts();
      } catch (err) { console.error(err); } finally { setBroadcastingId(null); }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10 font-sans">
<div className="flex justify-between items-end mb-8 border-b border-white/10 pb-6">
                <div>
                    <h2 className="text-3xl font-black text-white uppercase tracking-widest flex items-center gap-3">
                        <ShieldAlert className="text-rose-500 drop-shadow-glow-rose" size={32} />
                        {t('multi_agency_command_center')}
                    </h2>
                    <p className="text-slate-400 text-xs font-mono uppercase tracking-widest mt-2">{t('emergency_routing_dispatch_hub')}</p>
                </div>
                <div className="flex items-center gap-4">
                    <select
                        value={broadcastTarget}
                        onChange={(e) => setBroadcastTarget(e.target.value)}
                        className="bg-black/60 border border-white/10 text-white text-xs font-bold uppercase tracking-widest px-4 py-2.5 rounded-lg focus:outline-none focus:border-neon-cyan"
                    >
                        <option value="Police Department">{t('police_department')}</option>
                        <option value="Disaster Management">{t('disaster_management')}</option>
                        <option value="Water Department">{t('water_department')}</option>
                        <option value="State Health Ministry">{t('state_health_ministry')}</option>
                    </select>
                    <button onClick={fetchAlerts} className="bg-black/50 border border-white/10 hover:bg-white/5 text-slate-300 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors">
                        {t('refresh_feed')}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {loading ? (
                    <div className="text-center py-20 text-slate-500 font-mono text-xs uppercase animate-pulse">{t('scanning_frequencies')}</div>
                ) : alerts.length === 0 ? (
                    <div className="text-center py-20 text-neon-teal font-mono text-xs uppercase flex flex-col items-center gap-3">
                        <ShieldCheck size={32} /> {t('no_active_alerts')}
                    </div>
                ) : (
                    alerts.map(alert => (
                        <GlowCard key={alert.id} accent={alert.severity === 'High' ? 'rose' : 'amber'} className="p-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">

                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className={`px-2 py-1 text-[10px] font-black uppercase tracking-widest rounded border ${alert.severity === 'High' ? 'bg-rose-500/20 text-rose-400 border-rose-500/50' : 'bg-amber-500/20 text-amber-400 border-amber-500/50'
                                            }`}>
                                            {alert.severity} {t('severity')}
                                        </span>
                                        <span className="text-[10px] text-slate-400 font-mono">
                                            {new Date(alert.timestamp).toLocaleString()}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-1">{alert.type}</h3>
                                    <p className="text-sm text-slate-300 mb-2">{alert.description}</p>
                                    <p className="text-xs text-neon-cyan font-mono uppercase tracking-widest flex items-center gap-2">
                                        <Activity size={14} /> {t('origin')}: {alert.source_facility}
                                    </p>
                                </div>

                                <div className="flex-shrink-0 flex flex-col items-end gap-3 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6">
                                    {alert.broadcasted ? (
                                        <div className="text-right">
                                            <span className="inline-flex items-center gap-2 bg-neon-teal/10 text-neon-teal border border-neon-teal/30 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest">
                                                <ShieldCheck size={14} /> {t('dispatched_to')} {alert.broadcast_target}
                                            </span>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => handleBroadcast(alert.id)}
                                            disabled={broadcastingId === alert.id}
                                            className="w-full md:w-auto bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/50 px-6 py-3 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors shadow-glow-rose flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            {broadcastingId === alert.id ? <Radio size={16} className="animate-pulse" /> : <Radio size={16} />}
                                            {t('broadcast_alert')}
                                        </button>
                                    )}
                                </div>

                            </div>
                        </GlowCard>
                    ))
                )}
            </div>
        </div>
  );
};

export default CommandCenterPage;
