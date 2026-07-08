import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { useLanguage } from '../LanguageContext';
import { Activity, FileText, Plus, ClipboardList, Cpu, AlertTriangle } from 'lucide-react';
import GlowCard from './ui/GlowCard';
import { useNavigate } from 'react-router-dom';

const PatientLoggingPage = () => {
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';
    const navigate = useNavigate();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const { language } = useLanguage();

    // Admin AI Insights
    const [facilities, setFacilities] = useState([]);
    const [aiInsights, setAiInsights] = useState({});
    const [analyzing, setAnalyzing] = useState(null);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            // If admin, fetch all logs for potential aggregation, or we use specific AI endpoint
            const res = await fetch(`/api/footfall-log/${isAdmin ? 'ALL' : user?.center_id}`);
            const data = await res.json();
            setLogs(data);

            if (isAdmin) {
                const facRes = await fetch(`/api/district/surveillance`);
                setFacilities(await facRes.json());
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [user]);

    const handleGenerateInsight = async (centerId) => {
        setAnalyzing(centerId);
        try {
            const res = await fetch(`/api/district/footfall-analysis/${centerId}?lang=${language}`);
            const data = await res.json();
            setAiInsights(prev => ({ ...prev, [centerId]: data }));
        } catch (err) { console.error(err); } finally { setAnalyzing(null); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const form = e.target;
        const payload = {
            center_id: user?.center_id,
            patient_count: parseInt(form.patient_count.value),
            event_name: form.event_name.value || 'None',
            expected_attendance: parseInt(form.expected_attendance.value) || 0,
            disease_type: form.disease_type.value,
            reason_for_visit: form.reason_for_visit.value
        };

        try {
            await fetch(`/api/footfall-log`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            form.reset();
            fetchLogs();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-10 font-sans">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-widest flex items-center gap-3">
                        <Activity className="text-rose-400 drop-shadow-glow-rose" />
                        {isAdmin ? 'District Footfall Analysis' : 'Detailed Patient Logging'}
                    </h2>
                    <p className="text-slate-400 text-xs font-mono uppercase tracking-widest mt-1">Granular Footfall Tracking (Module 4)</p>
                </div>
            </div>

            {!isAdmin ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Input Form */}
                    <GlowCard accent="rose" className="p-6">
                        <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2 border-b border-white/10 pb-4">
                            <Plus size={18} className="text-rose-400" />
                            Log Daily Footfall
                        </h3>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Daily Patient Count</label>
                                    <input name="patient_count" type="number" required min={0} className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-rose-400 transition-colors" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Disease Type</label>
                                    <select name="disease_type" className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-rose-400 transition-colors cursor-pointer appearance-none">
                                        <option>General</option>
                                        <option>Respiratory / Viral</option>
                                        <option>Waterborne (e.g. Dengue)</option>
                                        <option>Trauma / Emergency</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Reason for Admission/Visit</label>
                                <textarea name="reason_for_visit" required placeholder="e.g., Fever, suspected Dengue, Road Accident, Heatstroke..." rows={2} className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-rose-400 transition-colors resize-none"></textarea>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Event/Festival Name (Optional)</label>
                                <input name="event_name" type="text" placeholder="e.g., Weekly Market, Monsoon Outbreak" className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-rose-400 transition-colors" />
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Expected Attendance at Event (if applicable)</label>
                                <input name="expected_attendance" type="number" min={0} defaultValue={0} className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-rose-400 transition-colors" />
                            </div>

                            <button type="submit" className="w-full mt-4 bg-rose-500/20 text-rose-400 border border-rose-500/40 hover:bg-rose-500/30 py-3 rounded-lg font-bold uppercase tracking-widest text-xs transition-all shadow-glow-rose">
                                Save Footfall Record
                            </button>
                        </form>
                    </GlowCard>

                    {/* Historical Log */}
                    <GlowCard accent="default" className="lg:col-span-2 p-6">
                        <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2 border-b border-white/10 pb-4">
                            <ClipboardList size={18} className="text-slate-400" />
                            Recent Footfall Logs
                        </h3>

                        <div className="space-y-4">
                            {loading ? (
                                <p className="text-slate-500 font-mono text-sm">Loading logs...</p>
                            ) : logs.length === 0 ? (
                                <p className="text-slate-500 font-mono text-sm">No specific patient logs found.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-white/10 text-[10px] uppercase tracking-widest text-slate-500">
                                                <th className="p-3 font-bold">Date</th>
                                                <th className="p-3 font-bold">Count</th>
                                                <th className="p-3 font-bold">Disease Type</th>
                                                <th className="p-3 font-bold">Reason/Notes</th>
                                                <th className="p-3 font-bold">Event/Condition</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {logs.map((log) => (
                                                <tr key={log.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                                    <td className="p-3 text-[10px] text-slate-500 font-mono">{new Date(log.date).toLocaleDateString()}</td>
                                                    <td className="p-3 text-sm font-bold text-slate-200">{log.patient_count}</td>
                                                    <td className="p-3">
                                                        <span className="px-2 py-1 rounded text-[10px] font-mono uppercase font-bold bg-white/10 text-slate-300">
                                                            {log.disease_type}
                                                        </span>
                                                    </td>
                                                    <td className="p-3 text-xs text-slate-400">{log.reason_for_visit || 'N/A'}</td>
                                                    <td className="p-3 text-xs text-rose-300 font-bold">{log.event_name}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </GlowCard>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {facilities.map(fac => {
                        const insight = aiInsights[fac.id];
                        const isAnalyzing = analyzing === fac.id;

                        return (
                            <GlowCard key={fac.id} accent="rose" className="p-6">
                                <h3 className="text-xl font-black text-white uppercase tracking-widest mb-4 border-b border-white/10 pb-4 flex justify-between items-center cursor-pointer hover:text-rose-400 transition-colors" onClick={() => navigate(`/facility/${fac.id}`)}>
                                    {fac.id}
                                    <Activity size={20} className="text-rose-400" />
                                </h3>

                                {insight ? (
                                    <div className="space-y-4">
                                        <div className="bg-black/50 p-4 rounded-lg border border-white/5">
                                            <p className="text-sm text-slate-300 font-mono leading-relaxed">{insight.trend_summary}</p>
                                        </div>
                                        <div>
                                            <h4 className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                <AlertTriangle size={12} />
                                                Action Recommendations
                                            </h4>
                                            <ul className="space-y-2">
                                                {insight.action_recommendations.map((rec, i) => (
                                                    <li key={i} className="text-xs text-slate-300 bg-white/5 p-2 rounded border border-white/5 font-mono">{rec}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-6">
                                        <button onClick={() => handleGenerateInsight(fac.id)} disabled={isAnalyzing} className="bg-rose-500/20 text-rose-400 border border-rose-500/40 hover:bg-rose-500/30 px-6 py-3 rounded-lg font-bold uppercase tracking-widest text-xs transition-all shadow-glow-rose flex items-center gap-2 mx-auto disabled:opacity-50">
                                            <Cpu size={16} className={isAnalyzing ? 'animate-pulse' : ''} />
                                            {isAnalyzing ? 'Analyzing Logs...' : 'Generate Insight'}
                                        </button>
                                    </div>
                                )}
                            </GlowCard>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default PatientLoggingPage;
