import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import GlowCard from './ui/GlowCard';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';

import { useLanguage } from '../LanguageContext';

const SurveillancePage = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const isObserver = user?.role === 'admin' || user?.role === 'mla';
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/district/surveillance?lang=${language}`)
      .then(res => res.json())
      .then(json => {
        // If staff, filter to only their center
        if (!isObserver) {
          setData(json.filter(f => f.id === user.center_id));
        } else {
          setData(json);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [isObserver, user, language]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-widest flex items-center gap-3">
            <ShieldAlert className="text-rose-500 drop-shadow-glow-rose" />
            {t('surveillance_grid')}
             </h2>
             <p className="text-slate-400 text-xs font-mono uppercase tracking-widest mt-1">{t('live_infection_tracking')}</p>
         </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-neon-cyan font-mono animate-pulse uppercase tracking-widest">
            {t('aggregating_logs')}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {data.map(facility => {
            const isHigh = facility.risk_tier === 'High' || facility.risk_tier === 'उच्च';
            const isElevated = facility.risk_tier === 'Elevated' || facility.risk_tier === 'बढ़ा हुआ';
            
            // Determine card accent and styles based on risk tier
            let accent = 'default';
            let bgClass = 'bg-black/40';
            let borderClass = 'border-white/5';
            let iconColor = 'text-neon-teal';
            let Icon = CheckCircle2;
            
            if (isHigh) {
                accent = 'rose';
                bgClass = 'bg-rose-950/20';
                borderClass = 'border-rose-500/50 shadow-[0_0_30px_rgba(244,63,94,0.15)]';
                iconColor = 'text-rose-500 drop-shadow-glow-rose';
                Icon = ShieldAlert;
            } else if (isElevated) {
                accent = 'purple'; // We use purple glow as elevated to match theme, or amber
                bgClass = 'bg-amber-950/20';
                borderClass = 'border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.1)]';
                iconColor = 'text-amber-500 drop-shadow-glow-amber';
                Icon = AlertTriangle;
            }

            return (
              <GlowCard 
                  key={facility.id} 
                  accent={accent} 
                  className={`p - 6 transition - all ${ bgClass } ${ borderClass } ${ isObserver? 'cursor-pointer hover:scale-[1.02]': '' }`}
                  onClick={() => isObserver ? navigate(`/ facility / ${ facility.id }`) : null}
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-black text-white">{facility.name}</h3>
                    <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mt-1">{facility.id} • {facility.location}</p>
                  </div>
                  <Icon size={32} className={`${ iconColor }`} />
                </div>
                
                <div className="flex items-center gap-4 mb-6">
                    <div className="flex-1">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{t('risk_tier')}</p>
                        <p className={`text - sm font - black uppercase tracking - wider ${ isHigh? 'text-rose-400': isElevated ? 'text-amber-400' : 'text-neon-teal' }`}>
                            {facility.risk_tier} {t('risk')}
                        </p>
                    </div>
                    <div className="flex-1 border-l border-white/10 pl-4">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{t('total_active_cases')}</p>
                        <p className="text-2xl font-black text-white">{facility.total_disease_cases}</p>
                    </div>
                </div>

                <div className="bg-black/50 border border-white/5 rounded-lg p-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Activity size={12} />
                        {t('recent_pathogen_logs')}
                    </p>
                    <div className="space-y-3">
                        {!facility.recent_logs || facility.recent_logs.length === 0 ? (
                            <p className="text-xs font-mono text-slate-500">{t('no_recent_disease_logs')}</p>
                        ) : (
                            facility.recent_logs.map(log => (
                                <div key={log.id} className="flex justify-between items-center text-sm border-b border-white/5 pb-2 last:border-0 last:pb-0">
                                    <span className="text-slate-200 font-semibold">{log.item_name}</span>
                                    <span className="text-rose-400 font-mono bg-rose-500/10 px-2 py-0.5 rounded text-xs border border-rose-500/20">
                                        +{log.quantity_used} {t('cases')}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
              </GlowCard>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SurveillancePage;
