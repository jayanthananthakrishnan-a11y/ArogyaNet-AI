import React, { useState, useEffect } from 'react';
import { Activity, Users, Package, Hospital, Sparkles, AlertTriangle, FileText, CheckCircle2, ChevronRight, ActivitySquare, Download, X, ArrowRightLeft, TrendingUp } from 'lucide-react';
import GlowCard from './ui/GlowCard';
import Sparkline from './ui/Sparkline';
import { useAuth } from '../AuthContext';
import { useLanguage } from '../LanguageContext';
import { useNavigate } from 'react-router-dom';

// --- ADMIN VIEW (Includes Module 5: Redistribution) ---
const AdminDashboard = () => {
    const { user } = useAuth();
    const { language, t } = useLanguage();
    const navigate = useNavigate();
    const [overview, setOverview] = useState(null);
    const [facilities, setFacilities] = useState([]);
    const [aiReport, setAiReport] = useState(null);
    const [loadingAI, setLoadingAI] = useState(false);

    // Formal Report State
    const [formalReport, setFormalReport] = useState(null);
    const [loadingFormal, setLoadingFormal] = useState(false);

    // Redistribution State
    const [redistributionManifest, setRedistributionManifest] = useState(null);
    const [loadingRedistribution, setLoadingRedistribution] = useState(false);

    useEffect(() => {
        fetch(`/api/district/overview?lang=${language}`)
            .then(res => res.json())
            .then(data => setOverview(data));

        fetch(`${import.meta.env.VITE_API_URL || ``}/api/district/facilities?lang=${language}`)
            .then(res => res.json())
            .then(data => setFacilities(data));

        fetch(`/api/district/logs`)
            .then(res => res.json())
            .then(data => setAiReport(prev => ({ ...prev, recent_logs: data })));
    }, [language]);

    const generateAIReport = () => {
        setLoadingAI(true);
        fetch(`${import.meta.env.VITE_API_URL || ``}/api/district/ai-report?lang=${language}`)
            .then(res => res.json())
            .then(data => { setAiReport(data); setLoadingAI(false); })
            .catch(err => { console.error(err); setLoadingAI(false); });
    };

    const generateFormalReport = () => {
        setLoadingFormal(true);
        fetch(`/api/district/formal-report?lang=${language}`)
            .then(res => res.json())
            .then(data => { setFormalReport(data); setLoadingFormal(false); })
            .catch(err => { console.error(err); setLoadingFormal(false); });
    };

    const runRedistributionEngine = () => {
        setLoadingRedistribution(true);
        fetch('/api/district/redistribution', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ language })
        })
            .then(res => res.json())
            .then(data => { setRedistributionManifest(data); setLoadingRedistribution(false); })
            .catch(err => { console.error(err); setLoadingRedistribution(false); });
    };

    const exportFormalReport = () => {
        if (!formalReport) return;

        const mdContent = `
# OFFICIAL DISTRICT HEALTH OPERATIONS REPORT
**Generated via ArogyaNet AI Command Center**

## 1. Executive Summary
${formalReport.executive_summary}

## 2. Predictive Procurement Warnings
${formalReport.procurement_warnings && formalReport.procurement_warnings.length > 0
                ? formalReport.procurement_warnings.map(w => `- [CRITICAL] ${w.item} at ${w.facility}: ${w.reason}`).join('\n')
                : 'No immediate shortages predicted based on current consumption velocity.'
            }

## 3. Disease Surveillance Trends
${formalReport.disease_trends && formalReport.disease_trends.length > 0
                ? formalReport.disease_trends.map(d => `- **${d.disease}**: ${d.trend}. Detected at: ${d.affected_facilities.join(', ')}`).join('\n')
                : 'No significant disease outbreaks detected.'
            }

## 4. Facility Performance
**Optimal Centers:**
${formalReport.optimal_centers && formalReport.optimal_centers.length > 0 ? formalReport.optimal_centers.map(c => `- ${c}`).join('\n') : 'None'}

**Centers Requiring Intervention:**
${formalReport.intervention_centers && formalReport.intervention_centers.length > 0 ? formalReport.intervention_centers.map(c => `- ${c.facility}: ${c.reason}`).join('\n') : 'None'}
      `.trim();

        const blob = new Blob([mdContent], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `District_Health_Report_${new Date().toISOString().split('T')[0]}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const kpis = [
        { title: t('total_phcs'), val: overview ? overview.total_phcs : "--", trend: "+3.5%", color: "#06b6d4", icon: Hospital, data: [30, 32, 35, 38, 38, overview ? overview.total_phcs : 38] },
        { title: t('patients_today'), val: overview ? overview.live_patients : "--", trend: "+12%", color: "#14b8a6", icon: Users, data: [4000, 4500, 5200, 6000, 5800, overview ? overview.live_patients : 6248] },
        { title: t('available_beds'), val: "1,247", trend: "-2.1%", color: "#f59e0b", icon: Activity, data: [1300, 1280, 1250, 1260, 1247] },
        { title: t('medicine_stock'), val: overview ? `${overview.stock_health}%` : "--", trend: "-5%", color: "#8b5cf6", icon: Package, data: [85, 83, 80, 79, overview ? overview.stock_health : 78] },
    ];

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-10">

            {/* Formal Report Modal */}
            {formalReport && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-white/20 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar shadow-[0_0_50px_rgba(6,182,212,0.15)] relative">
                        <div className="sticky top-0 bg-slate-900/90 backdrop-blur border-b border-white/10 p-6 flex justify-between items-center z-10">
                            <div>
                                <h2 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-3">
                                    <FileText className="text-neon-cyan" />
                                    Official District Health Report
                                </h2>
                                <p className="text-slate-400 text-xs font-mono uppercase mt-1">Multi-Agency Formatted Output</p>
                            </div>
                            <div className="flex gap-4">
                                <button onClick={exportFormalReport} className="flex items-center gap-2 bg-neon-cyan text-black px-4 py-2 rounded-lg font-bold uppercase tracking-widest text-xs shadow-glow-cyan hover:bg-neon-cyan/80 transition-colors">
                                    <Download size={16} /> Export (.md)
                                </button>
                                <button onClick={() => setFormalReport(null)} className="p-2 bg-white/5 hover:bg-rose-500/20 hover:text-rose-400 rounded-lg text-slate-400 transition-colors">
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="p-8 space-y-8 text-slate-200">
                            <section>
                                <h3 className="text-sm font-bold text-neon-teal uppercase tracking-widest border-b border-white/10 pb-2 mb-4">1. Executive Summary</h3>
                                <p className="leading-relaxed text-sm bg-black/30 p-4 rounded-xl border border-white/5">{formalReport.executive_summary}</p>
                            </section>

                            <section>
                                <h3 className="text-sm font-bold text-rose-400 uppercase tracking-widest border-b border-white/10 pb-2 mb-4">2. Predictive Procurement Warnings</h3>
                                {formalReport.procurement_warnings?.length > 0 ? (
                                    <div className="grid gap-3">
                                        {formalReport.procurement_warnings.map((w, i) => (
                                            <div key={i} className="bg-rose-950/20 border border-rose-500/30 p-4 rounded-xl flex gap-4 items-start">
                                                <AlertTriangle className="text-rose-500 shrink-0 mt-0.5" size={20} />
                                                <div>
                                                    <h4 className="font-bold text-rose-300">{w.item} <span className="text-xs text-rose-200/50 font-mono">@{w.facility}</span></h4>
                                                    <p className="text-sm text-rose-200/80 mt-1">{w.reason}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : <p className="text-sm text-slate-400 font-mono">No imminent shortages predicted.</p>}
                            </section>

                            <section>
                                <h3 className="text-sm font-bold text-amber-400 uppercase tracking-widest border-b border-white/10 pb-2 mb-4">3. Disease Surveillance Trends</h3>
                                {formalReport.disease_trends?.length > 0 ? (
                                    <ul className="space-y-3">
                                        {formalReport.disease_trends.map((d, i) => (
                                            <li key={i} className="bg-amber-950/20 border border-amber-500/30 p-4 rounded-xl">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="font-bold text-amber-400">{d.disease}</span>
                                                    <span className="text-[10px] bg-amber-500/20 px-2 py-1 rounded text-amber-300 font-mono uppercase">{d.trend}</span>
                                                </div>
                                                <p className="text-xs text-amber-200/70">Detected Facilities: {d.affected_facilities.join(', ')}</p>
                                            </li>
                                        ))}
                                    </ul>
                                ) : <p className="text-sm text-slate-400 font-mono">No abnormal trends detected.</p>}
                            </section>

                            <section className="grid grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-sm font-bold text-neon-cyan uppercase tracking-widest border-b border-white/10 pb-2 mb-4">4A. Optimal Centers</h3>
                                    <ul className="space-y-2">
                                        {formalReport.optimal_centers?.map((c, i) => (
                                            <li key={i} className="flex items-center gap-2 text-sm bg-neon-cyan/5 border border-neon-cyan/20 p-2 rounded-lg">
                                                <CheckCircle2 size={16} className="text-neon-cyan" /> {c}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-rose-400 uppercase tracking-widest border-b border-white/10 pb-2 mb-4">4B. Requires Intervention</h3>
                                    <ul className="space-y-2">
                                        {formalReport.intervention_centers?.map((c, i) => (
                                            <li key={i} className="text-sm bg-rose-500/5 border border-rose-500/20 p-3 rounded-lg">
                                                <div className="font-bold text-rose-400 mb-1 flex items-center gap-2"><AlertTriangle size={14} /> {c.facility}</div>
                                                <div className="text-xs text-rose-200/70">{c.reason}</div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            )}

            {/* Redistribution Manifest Modal */}
            {redistributionManifest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-neon-purple/40 rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto custom-scrollbar shadow-[0_0_50px_rgba(139,92,246,0.15)] relative">
                        <div className="sticky top-0 bg-slate-900/90 backdrop-blur border-b border-neon-purple/20 p-6 flex justify-between items-center z-10">
                            <div>
                                <h2 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-3">
                                    <ArrowRightLeft className="text-neon-purple" />
                                    Smart Redistribution Manifest
                                </h2>
                                <p className="text-slate-400 text-xs font-mono uppercase mt-1">Autonomous Logistics Optimizer</p>
                            </div>
                            <button onClick={() => setRedistributionManifest(null)} className="p-2 bg-white/5 hover:bg-rose-500/20 hover:text-rose-400 rounded-lg text-slate-400 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-8 space-y-6 text-slate-200">
                            <div className="flex gap-4 mb-4">
                                <div className="flex-1 bg-neon-teal/10 border border-neon-teal/30 p-4 rounded-xl">
                                    <h4 className="text-xs font-bold text-neon-teal uppercase tracking-widest mb-1">Estimated Savings</h4>
                                    <p className="text-lg font-bold text-white">{redistributionManifest.estimated_savings || 'Calculated automatically'}</p>
                                </div>
                                <div className="flex-2 bg-white/5 border border-white/10 p-4 rounded-xl">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Executive Summary</h4>
                                    <p className="text-sm font-semibold">{redistributionManifest.summary}</p>
                                </div>
                            </div>

                            <h3 className="text-sm font-bold text-neon-purple uppercase tracking-widest border-b border-white/10 pb-2 mb-4">Logistical Directives</h3>

                            <div className="space-y-4">
                                {redistributionManifest.manifest?.length > 0 ? redistributionManifest.manifest.map((route, i) => (
                                    <div key={i} className="bg-black/50 border border-neon-purple/20 p-5 rounded-xl flex items-center justify-between group hover:border-neon-purple/50 transition-colors">
                                        <div className="flex items-center gap-8">
                                            <div className="text-center w-32">
                                                <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest mb-1">Surplus Source</p>
                                                <p className="font-bold text-neon-teal">{route.from_facility}</p>
                                            </div>

                                            <div className="flex flex-col items-center">
                                                <p className="text-xs font-bold text-white mb-1 bg-white/10 px-3 py-1 rounded-full">{route.quantity}x {route.item}</p>
                                                <div className="h-0.5 w-32 bg-gradient-to-r from-neon-teal via-neon-purple to-rose-400 relative">
                                                    <ArrowRightLeft className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/50" size={14} />
                                                </div>
                                                <p className="text-[10px] font-mono text-slate-400 mt-2">{route.logistics_time}</p>
                                            </div>

                                            <div className="text-center w-32">
                                                <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest mb-1">Deficit Target</p>
                                                <p className="font-bold text-rose-400">{route.to_facility}</p>
                                            </div>
                                        </div>
                                        <div className="max-w-[200px] text-right">
                                            <p className="text-xs text-slate-400 font-mono bg-white/5 p-2 rounded">{route.reason}</p>
                                        </div>
                                    </div>
                                )) : (
                                    <p className="text-slate-400 font-mono text-sm text-center py-8">District is fully balanced. No transfers required.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex justify-between items-end mb-8">
                <div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-widest flex items-center gap-3">
                        <Hospital className="text-neon-cyan drop-shadow-glow-cyan" />
                        District Command Center
                    </h2>
                    <p className="text-slate-400 text-xs font-mono uppercase tracking-widest mt-1">Aggregated Operations View</p>
                </div>
                <div className="flex gap-4">
                    <button onClick={runRedistributionEngine} disabled={loadingRedistribution} className="flex items-center gap-2 bg-neon-purple/10 border border-neon-purple/50 text-neon-purple hover:bg-neon-purple/20 px-5 py-2.5 rounded-lg font-black uppercase tracking-widest text-xs transition-all shadow-[0_0_20px_rgba(139,92,246,0.2)] disabled:opacity-50">
                        <ArrowRightLeft size={18} />
                        {loadingRedistribution ? 'Calculating Routes...' : 'Redistribution Engine'}
                    </button>
                    <button onClick={generateFormalReport} disabled={loadingFormal} className="flex items-center gap-2 bg-white text-black hover:bg-slate-200 px-5 py-2.5 rounded-lg font-black uppercase tracking-widest text-xs transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] disabled:opacity-50">
                        <FileText size={18} />
                        {loadingFormal ? 'Compiling...' : 'Generate Official Report'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {kpis.map((kpi, idx) => (
                    <GlowCard key={idx} accent="default" className="p-4 flex flex-col justify-between">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/5 border border-white/10 shadow-lg" style={{ color: kpi.color }}>
                                <kpi.icon size={20} style={{ filter: `drop-shadow(0 0 10px ${kpi.color})` }} />
                            </div>
                            <span className={`text-xs font-bold font-mono px-2 py-1 rounded bg-black/40 border ${kpi.trend.startsWith('+') ? 'text-neon-teal border-neon-teal/30' : 'text-rose-400 border-rose-500/30'}`}>
                                {kpi.trend}
                            </span>
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{kpi.title}</p>
                            <h3 className="text-2xl font-black text-white tracking-wider my-1">{kpi.val}</h3>
                        </div>
                        <div className="h-10 mt-2 opacity-60">
                            <Sparkline data={kpi.data} color={kpi.color} />
                        </div>
                    </GlowCard>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                <GlowCard className="lg:col-span-2 p-6" accent="cyan">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <Hospital className="text-neon-cyan drop-shadow-glow-cyan" />
                            <h3 className="text-sm font-black text-white uppercase tracking-widest">{t('district_facilities')}</h3>
                        </div>
                        <button onClick={generateAIReport} disabled={loadingAI} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neon-purple bg-neon-purple/10 px-4 py-2 rounded-lg border border-neon-purple/30 hover:bg-neon-purple/20 transition-colors shadow-glow-purple disabled:opacity-50">
                            <Sparkles size={16} />
                            {loadingAI ? t('analyzing_district') : t('ai_pulse_check')}
                        </button>
                    </div>

                    {aiReport?.ai_analysis && (
                        <div className={`mb-6 p-4 border rounded-xl bg-black/40 ${aiReport.ai_analysis.status === 'Critical' ? 'border-rose-500/50 text-rose-400' : 'border-neon-teal/50 text-neon-teal'}`}>
                            <h4 className="text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                                {aiReport.ai_analysis.status === 'Critical' ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
                                {t('ai_insight')}: {aiReport.ai_analysis.status}
                            </h4>
                            <p className="text-sm text-slate-200 leading-relaxed mb-3">{aiReport.ai_analysis.summary}</p>
                            <ul className="space-y-1">
                                {aiReport.ai_analysis.key_insights.map((insight, idx) => (
                                    <li key={idx} className="flex gap-2 text-xs text-slate-400 items-start">
                                        <span className="text-neon-purple font-mono font-bold">{(idx + 1).toString().padStart(2, '0')}</span>
                                        {insight}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="space-y-3">
                        {facilities.map(facility => (
                            <div key={facility.id} onClick={() => navigate(`/inventory?center_id=${facility.id}`)} className="p-4 bg-black/40 border border-white/5 rounded-xl hover:bg-white/5 hover:border-white/20 transition-all cursor-pointer flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${facility.critical_alerts > 0 ? 'bg-rose-500/20 text-rose-400' : 'bg-neon-teal/20 text-neon-teal'}`}>
                                        {facility.critical_alerts > 0 ? <AlertTriangle size={24} /> : <ActivitySquare size={24} />}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-200">{facility.name}</h4>
                                        <p className="text-[10px] uppercase font-mono text-slate-500">{facility.location} • {t('avg_footfall')}: {facility.footfall_avg}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-sm font-bold text-white">{facility.total_beds}</p>
                                        <p className="text-[10px] uppercase font-mono text-slate-500">{t('total_beds')}</p>
                                    </div>
                                    <ChevronRight className="text-slate-600 group-hover:text-neon-cyan transition-colors" />
                                </div>
                            </div>
                        ))}
                    </div>
                </GlowCard>

                <GlowCard className="p-6" accent="purple">
                    <div className="flex items-center gap-3 mb-6">
                        <FileText className="text-neon-purple drop-shadow-glow-purple" />
                        <h3 className="text-sm font-black text-white uppercase tracking-widest">{t('recent_district_logs')}</h3>
                    </div>
                    <div className="space-y-4 overflow-y-auto max-h-[400px] custom-scrollbar pr-2">
                        {aiReport?.recent_logs?.map(log => (
                            <div key={log.id} className="p-3 bg-black/40 border border-white/5 rounded-lg">
                                <div className="flex justify-between items-center mb-1 text-[10px] uppercase font-bold text-slate-500">
                                    <span>{log.center_id}</span>
                                    <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <p className="text-sm text-slate-200 font-semibold">{log.item_name}</p>
                                <p className="text-xs text-slate-400 font-mono mt-1">
                             {log.type === 'consumption' ? `${t('used')}: ${log.quantity_used} ${t('units')}` : log.type === 'disease' ? `${t('reported')}: ${log.quantity_used} ${t('cases')}` : `${t('defect')}: ${log.notes}`}
                         </p>
                     </div>
                 ))}
             </div>
          </GlowCard>
      </div>
    </div>
  );
};

// --- STAFF VIEW (Includes Module 4: Footfall Forecasting) ---
const StaffDashboard = ({ center_id }) => {
  const { t, language } = useLanguage();
  const [eventDesc, setEventDesc] = useState('');
  const [footfallData, setFootfallData] = useState(null);
  const [loadingFootfall, setLoadingFootfall] = useState(false);
  const [dashboardStats, setDashboardStats] = useState(null);

  useEffect(() => {
    if (center_id) {
        fetch(`/api/dashboard/stats/${center_id}`)
            .then(res => res.json())
            .then(data => setDashboardStats(data))
            .catch(err => console.error(err));
    }
  }, [center_id]);

  const runFootfallPrediction = async () => {
      if (!eventDesc) return;
      setLoadingFootfall(true);
      try {
        const res = await fetch('/api/district/footfall-prediction', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ center_id, event_description: eventDesc, language })
        });
        const data = await res.json();
        setFootfallData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingFootfall(false);
      }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10 font-sans">
<div className="flex justify-between items-end mb-8">
                                        <div>
                                            <h2 className="text-2xl font-black text-white uppercase tracking-widest flex items-center gap-3">
                                                <Activity className="text-neon-cyan drop-shadow-glow-cyan" />
                                                {t('dashboard')}
                                            </h2>
                                            <p className="text-slate-400 text-xs font-mono uppercase tracking-widest mt-1">{t('district_overview_analytics')}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        <GlowCard accent={dashboardStats?.status === 'ACTION REQUIRED' ? 'rose' : 'purple'} className="p-10 text-center border-white/10 lg:col-span-2 flex flex-col justify-center items-center">
                                            {dashboardStats?.status === 'ACTION REQUIRED' ? (
                                                <>
                                                    <AlertTriangle size={48} className="mx-auto text-rose-500 mb-4 drop-shadow-glow-rose" />
                                                    <h3 className="text-xl font-bold text-white uppercase tracking-widest mb-2">ACTION REQUIRED</h3>
                                                    <p className="text-rose-300 text-sm mb-4">Critical inventory shortages detected!</p>
                                                    <ul className="text-left bg-black/40 border border-rose-500/20 p-4 rounded-xl w-full max-w-md space-y-2">
                                                        {dashboardStats.critical_items.map((item, idx) => (
                                                            <li key={idx} className="flex justify-between text-sm font-mono">
                                                                <span className="text-slate-300">{item.name} <span className="text-[10px] text-slate-500 ml-2">({item.category})</span></span>
                                                                <span className="text-rose-400 font-bold">{item.quantity}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle2 size={48} className="mx-auto text-neon-teal mb-4 drop-shadow-glow-teal" />
                                                    <h3 className="text-xl font-bold text-white uppercase tracking-widest mb-2">Systems Nominal</h3>
                                                    <p className="text-slate-400 text-sm">Please navigate to the "Daily Operations" tab to log consumption and report defects.</p>
                                                </>
                                            )}
                                        </GlowCard>

                                        {/* Module 4: Readiness & Forecasting Widget */}
                                        <GlowCard accent="teal" className="p-6">
                                            <div className="flex items-center gap-3 mb-6">
                                                <TrendingUp className="text-neon-teal drop-shadow-glow-teal" />
                                                <h3 className="text-sm font-black text-white uppercase tracking-widest">Footfall Predictor</h3>
                                            </div>

                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Simulate Future Event</label>
                                                    <input
                                                        type="text"
                                                        value={eventDesc}
                                                        onChange={(e) => setEventDesc(e.target.value)}
                                                        placeholder="e.g. Monsoon Outbreak, Local Festival"
                                                        className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-neon-teal transition-colors"
                                                    />
                                                </div>
                                                <button
                                                    onClick={runFootfallPrediction}
                                                    disabled={loadingFootfall || !eventDesc}
                                                    className="w-full bg-neon-teal/20 text-neon-teal border border-neon-teal/40 hover:bg-neon-teal/30 py-3 rounded-lg font-bold uppercase tracking-widest text-xs transition-all shadow-[0_0_15px_rgba(20,184,166,0.15)] disabled:opacity-50"
                                                >
                                                    {loadingFootfall ? 'Running AI Model...' : 'Run Simulation'}
                                                </button>

                                                {footfallData && (
                                                    <div className="mt-6 pt-6 border-t border-white/10 space-y-4">
                                                        <div className="bg-black/40 p-4 rounded-xl border border-neon-teal/20">
                                                            <h4 className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Expected Surge</h4>
                                                            <p className="text-2xl font-black text-neon-teal">{footfallData.expected_footfall_increase}</p>
                                                            <p className="text-xs text-slate-500 font-mono mt-1">Simulated: {footfallData.event}</p>
                                                        </div>
                                                        <div>
                                                            <h4 className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mb-3">AI Readiness Action Plan</h4>
                                                            <ul className="space-y-2">
                                                                {footfallData.readiness_actions?.map((action, i) => (
                                                                    <li key={i} className="flex gap-3 text-xs text-slate-300 items-start bg-rose-500/5 p-3 rounded-lg border border-rose-500/10">
                                                                        <AlertTriangle size={14} className="text-rose-400 shrink-0 mt-0.5" />
                                                                        <span className="leading-relaxed">{action}</span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </GlowCard>
                                    </div>
                            </div>
                        );
};

const Dashboard = () => {
  const {user} = useAuth();

                        if (user?.role === 'admin') {
      return <AdminDashboard />;
  }
                        return <StaffDashboard center_id={user?.center_id} />;
};

                        export default Dashboard;
