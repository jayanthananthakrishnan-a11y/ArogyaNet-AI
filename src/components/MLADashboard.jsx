import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, Package, TrendingUp } from 'lucide-react';
import GlowCard from './ui/GlowCard';
import Sparkline from './ui/Sparkline';
import { useLanguage } from '../LanguageContext';

const MLADashboard = () => {
  const { language, t } = useLanguage();
  const [overview, setOverview] = useState(null);
  const [facilities, setFacilities] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [trendAnalytics, setTrendAnalytics] = useState(null);
  const [governanceRecs, setGovernanceRecs] = useState([]);
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiGenerated, setAiGenerated] = useState(false);

  useEffect(() => {
    fetch(`/api/district/overview?lang=${language}`)
      .then(res => res.json())
      .then(data => setOverview(data))
      .catch(err => console.error(err));

    fetch('/api/district/facilities')
      .then(res => res.json())
      .then(data => setFacilities(data))
      .catch(err => console.error(err));

    fetch(`/api/district/alerts`)
      .then(res => res.json())
      .then(data => setAlerts(data))
      .catch(err => console.error(err));
  }, [language]);

  const generateAIAssessment = () => {
    setLoadingAI(true);
    setAiGenerated(true);
    Promise.all([
      fetch(`${import.meta.env.VITE_API_URL || ''}/api/mla/trend-analytics?lang=${language}`).then(res => res.json()),
      fetch(`/api/mla/governance-recommendations?lang=${language}`).then(res => res.json())
    ])
      .then(([trendData, govData]) => {
        setTrendAnalytics(trendData.trend_summary);
        setGovernanceRecs(govData.recommendations || []);
      })
      .catch(err => console.error(err))
      .finally(() => setLoadingAI(false));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10 font-sans">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-widest flex items-center gap-3">
            <TrendingUp className="text-neon-teal drop-shadow-glow-teal" />
            {language === 'hi' ? 'प्रतिनिधि अवलोकन' : 'Representative Overview'}
          </h2>
          <p className="text-slate-400 text-xs font-mono uppercase tracking-widest mt-1">
            {language === 'hi' ? 'उच्च-स्तरीय ज़िला स्वास्थ्य संकेतक' : 'High-Level District Health Indicators'}
          </p>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <GlowCard accent="cyan" className="flex items-center gap-4">
          <div className="bg-neon-cyan/20 p-3 rounded-full text-neon-cyan">
            <Activity size={24} />
          </div>
          <div>
             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{language === 'hi' ? 'कुल PHC' : 'Total PHCs'}</p>
             <p className="text-2xl font-black text-white">{overview?.total_phcs || '--'}</p>
          </div>
        </GlowCard>
        
        <GlowCard accent="teal" className="flex items-center gap-4">
          <div className="bg-neon-teal/20 p-3 rounded-full text-neon-teal">
            <Package size={24} />
          </div>
          <div>
             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{language === 'hi' ? 'स्टॉक स्वास्थ्य' : 'Stock Health'}</p>
             <p className="text-2xl font-black text-white">{overview?.stock_health || '--'}%</p>
          </div>
          <div className="ml-auto w-16 opacity-50">
             <Sparkline data={[60, 65, 70, 75, 72, 78]} color="#06b6d4" />
          </div>
        </GlowCard>
      </div>

      {/* AI Enhancements Row */}
      <div className="mb-6">
          {!aiGenerated ? (
              <button onClick={generateAIAssessment} className="w-full bg-neon-purple/20 text-neon-purple border border-neon-purple/50 hover:bg-neon-purple/30 py-4 rounded-xl font-black uppercase tracking-widest text-sm transition-all shadow-glow-purple flex items-center justify-center gap-3">
                  <Activity size={20} />
                  {language === 'hi' ? 'एआई विश्लेषण उत्पन्न करें' : 'Generate AI Analysis'}
              </button>
          ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Trend Analytics */}
        <GlowCard accent="purple" className="p-6">
          <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
            <Activity size={18} className="text-neon-purple" />
            {language === 'hi' ? 'ट्रेंड एनालिटिक्स (पिछले 30 दिन)' : 'Trend Analytics (Last 30 Days)'}
          </h3>
          <div className="bg-black/40 border border-white/5 rounded-xl p-4 min-h-[100px] flex items-center">
            {loadingAI ? (
              <p className="text-slate-500 font-mono text-sm animate-pulse">Generating AI summary...</p>
            ) : (
              <p className="text-slate-300 text-sm leading-relaxed">{trendAnalytics || 'No data available.'}</p>
            )}
          </div>
        </GlowCard>

        {/* AI Governance View */}
        <GlowCard accent="cyan" className="p-6">
          <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
            <ShieldAlert size={18} className="text-neon-cyan" />
            {language === 'hi' ? 'एआई गवर्नेंस सुझाव' : 'AI Governance View'}
          </h3>
          <div className="bg-black/40 border border-white/5 rounded-xl p-4 min-h-[100px]">
            {loadingAI ? (
              <p className="text-slate-500 font-mono text-sm animate-pulse">Generating recommendations...</p>
            ) : (
              <ul className="space-y-3">
                {governanceRecs.map((rec, i) => (
                  <li key={i} className="text-slate-300 text-sm flex items-start gap-2">
                    <span className="text-neon-cyan shrink-0 mt-1">▹</span>
                    {rec}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </GlowCard>
      </div>
      )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Major Shortages */}
        <GlowCard accent="default" className="p-6">
          <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
            <ShieldAlert size={18} className="text-rose-400" />
            {language === 'hi' ? 'प्रमुख कमियां / कर्मचारी आवश्यकताएं' : 'Major Shortages / Staff Needs'}
          </h3>
          <div className="space-y-4">
            {facilities.filter(f => f.staff_shortage > 0 || f.status === 'Critical').length === 0 ? (
              <p className="text-slate-400 text-sm">{language === 'hi' ? 'कोई बड़ी कमी नहीं पाई गई।' : 'No major shortages detected.'}</p>
            ) : (
              facilities.filter(f => f.staff_shortage > 0 || f.status === 'Critical').map(fac => (
                <div key={fac.id} className="bg-black/40 border border-white/5 rounded-xl p-4 flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-white uppercase text-sm tracking-widest">{fac.id}</h4>
                    <p className="text-xs text-slate-400 mt-1">{fac.type}</p>
                  </div>
                  <div className="text-right">
                    {fac.staff_shortage > 0 && <span className="block text-rose-400 text-xs font-bold uppercase tracking-widest">Staff Shortage: {fac.staff_shortage}%</span>}
                    {fac.status === 'Critical' && <span className="block text-rose-400 text-xs font-bold uppercase tracking-widest">Inventory: Critical</span>}
                  </div>
                </div>
              ))
            )}
          </div>
        </GlowCard>

        {/* Critical Alerts */}
        <GlowCard accent="default" className="p-6">
          <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
            <Activity size={18} className="text-amber-400" />
            {language === 'hi' ? 'सक्रिय हाई-अलर्ट' : 'Active High-Alerts'}
          </h3>
          <div className="space-y-4">
            {alerts.filter(a => a.severity === 'High').length === 0 ? (
              <p className="text-slate-400 text-sm">{language === 'hi' ? 'कोई सक्रिय हाई-अलर्ट नहीं है।' : 'No active high-alerts.'}</p>
            ) : (
              alerts.filter(a => a.severity === 'High').map(alert => (
                <div key={alert.id} className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 shadow-[0_0_15px_rgba(244,63,94,0.1)]">
                  <div className="flex justify-between items-start mb-2">
                    <span className="bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded">
                      {alert.type}
                    </span>
                    <span className="text-slate-400 text-[10px] font-mono">{new Date(alert.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <h4 className="font-bold text-rose-400 text-sm mb-1">{alert.source_facility}</h4>
                  <p className="text-slate-300 text-xs">{alert.description}</p>
                </div>
              ))
            )}
          </div>
        </GlowCard>
      </div>

    </div>
  );
};

export default MLADashboard;
