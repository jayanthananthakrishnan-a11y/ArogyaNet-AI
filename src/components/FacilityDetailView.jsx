import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Activity, Users, Package, AlertTriangle, CheckCircle2 } from 'lucide-react';
import GlowCard from './ui/GlowCard';

const FacilityDetailView = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [logistics, setLogistics] = useState(null);
    const [attendance, setAttendance] = useState([]);
    const [footfall, setFootfall] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);
            try {
                const invRes = await fetch(`/api/inventory/${id}`);
                setLogistics(await invRes.json());

                const attRes = await fetch(`${import.meta.env.VITE_API_URL || ``}/api/attendance/${id}`);
                setAttendance(await attRes.json());

                const footRes = await fetch(`/api/footfall-log/${id}`);
                setFootfall(await footRes.json());
            } catch (err) { console.error(err); } finally { setLoading(false); }
        };
        fetchAll();
    }, [id]);

    if (loading) return <div className="text-center py-20 text-neon-cyan font-mono animate-pulse tracking-widest uppercase">Loading Facility Data...</div>;

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-10 font-sans">
            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => navigate(-1)} className="p-2 bg-black/40 border border-white/10 rounded-lg hover:bg-white/5 transition-colors text-slate-400 hover:text-white">
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-widest">{id} Drill-Down</h2>
                    <p className="text-slate-400 text-xs font-mono uppercase tracking-widest mt-1">Deep Facility Insights</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Inventory Overview */}
                <GlowCard accent="cyan" className="p-6">
                    <h3 className="text-lg font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-white/10 pb-2">
                        <Package size={20} className="text-neon-cyan" />
                        Logistics & Inventory
                    </h3>
                    <div className="space-y-3">
                        {logistics?.consumables?.slice(0, 5).map(item => (
                            <div key={item.id} className="bg-black/40 border border-white/5 p-3 rounded-lg flex justify-between items-center">
                                <div>
                                    <p className="text-sm font-bold text-white">{item.name}</p>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">EXP: {item.expiry_date || 'N/A'}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-black text-neon-cyan">{item.quantity}</p>
                                    <p className="text-[10px] text-slate-500 uppercase">Stock</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </GlowCard>

                {/* Attendance Roster */}
                <GlowCard accent="purple" className="p-6">
                    <h3 className="text-lg font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-white/10 pb-2">
                        <Users size={20} className="text-neon-purple" />
                        Today's Attendance
                    </h3>
                    <div className="space-y-3">
                        {attendance.length === 0 ? <p className="text-slate-500 text-xs">No records found.</p> : attendance.map(att => (
                            <div key={att.id} className="bg-black/40 border border-white/5 p-3 rounded-lg flex justify-between items-center">
                                <div>
                                    <p className="text-sm font-bold text-white">{att.staff_name}</p>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">{att.role} • {att.department}</p>
                                </div>
                                <div>
                                    <span className={`px-2 py-1 rounded text-[10px] font-mono uppercase font-bold ${att.status === 'Present' ? 'bg-neon-teal/20 text-neon-teal' : 'bg-rose-500/20 text-rose-400'}`}>
                                        {att.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </GlowCard>

                {/* Equipment Status */}
                <GlowCard accent="purple" className="p-6">
                    <h3 className="text-lg font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-white/10 pb-2">
                        <AlertTriangle size={20} className="text-neon-purple" />
                        Medical Equipment Status
                    </h3>
                    <div className="space-y-3">
                        {!logistics?.equipment || logistics.equipment.length === 0 ? <p className="text-slate-500 text-xs font-mono">No equipment tracked.</p> : logistics.equipment.map(item => (
                            <div key={item.id} className="bg-black/40 border border-white/5 p-3 rounded-lg flex justify-between items-center">
                                <div>
                                    <p className="text-sm font-bold text-white">{item.name}</p>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono mt-1">Serviced: {item.last_serviced_date || 'Unknown'}</p>
                                </div>
                                <div>
                                    <span className={`px-2 py-1 rounded text-[10px] font-mono uppercase font-bold tracking-wider ${item.status === 'Functional' ? 'bg-neon-teal/20 text-neon-teal border border-neon-teal/50' : 'bg-rose-500/20 text-rose-400 border border-rose-500/50'}`}>
                                        {item.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </GlowCard>

                {/* Footfall Trends */}
                <GlowCard accent="rose" className="lg:col-span-2 p-6">
                    <h3 className="text-lg font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-white/10 pb-2">
                        <Activity size={20} className="text-rose-400" />
                        Patient Footfall
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {footfall.length === 0 ? <p className="text-slate-500 text-xs">No footfall logged.</p> : footfall.map(log => (
                            <div key={log.id} className="bg-black/40 border border-rose-500/20 p-4 rounded-lg">
                                <p className="text-2xl font-black text-white mb-1">{log.patient_count}</p>
                                <p className="text-xs font-bold text-rose-400 uppercase tracking-widest">{log.disease_type}</p>
                                <p className="text-[10px] text-slate-500 font-mono mt-2">{log.event_name !== 'None' ? `Event: ${log.event_name}` : 'Standard Operations'}</p>
                                <p className="text-[10px] text-slate-600 font-mono">{new Date(log.date).toLocaleDateString()}</p>
                            </div>
                        ))}
                    </div>
                </GlowCard>
            </div>
        </div>
    );
};

export default FacilityDetailView;
