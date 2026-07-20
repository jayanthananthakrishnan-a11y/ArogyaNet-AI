import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Activity, Users, Package, AlertTriangle, Trash2, Truck } from 'lucide-react';
import GlowCard from './ui/GlowCard';

const FacilityDetailView = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [logistics, setLogistics] = useState(null);
    const [attendance, setAttendance] = useState([]);
    const [footfall, setFootfall] = useState([]);
    const [staff, setStaff] = useState([]);
    const [facilityInfo, setFacilityInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const invRes = await fetch(`/api/inventory/${id}`);
            setLogistics(await invRes.json());

            const attRes = await fetch(`${import.meta.env.VITE_API_URL || ``}/api/attendance/${id}`);
            setAttendance(await attRes.json());

            const footRes = await fetch(`/api/footfall-log/${id}`);
            setFootfall(await footRes.json());

            const usrRes = await fetch(`/api/users`);
            if (usrRes.ok) {
                const allUsers = await usrRes.json();
                setStaff(allUsers.filter(u => u.center_id === id));
            }

            const facRes = await fetch('/api/district/facilities');
            if (facRes.ok) {
                const allFacs = await facRes.json();
                setFacilityInfo(allFacs.find(f => f.id === id));
            }
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    const handleEditFacility = async (e) => {
        e.preventDefault();
        const form = e.target;
        const payload = {
            name: form.name.value,
            type: form.type.value,
            location: form.location.value,
            total_beds: parseInt(form.total_beds.value)
        };
        try {
            const res = await fetch(`/api/facilities/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                alert('Facility updated!');
                fetchAll();
            }
        } catch (err) { console.error(err); }
    };

    const handleAddAmbulance = async (e) => {
        e.preventDefault();
        const form = e.target;
        const payload = {
            center_id: id,
            category: 'transport',
            itemData: {
                name: form.name.value,
                status: form.status.value,
                fuel_level: form.fuel.value + '%'
            }
        };
        try {
            const res = await fetch(`/api/inventory/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                form.reset();
                fetchAll();
            }
        } catch (err) { console.error(err); }
    };

    useEffect(() => {
        fetchAll();
    }, [id]);

    const handleDeleteStaff = async (username) => {
        if (!window.confirm(`Delete staff member ${username}?`)) return;
        try {
            const res = await fetch(`/api/users/${username}`, { method: 'DELETE' });
            if (res.ok) fetchAll();
        } catch (err) { console.error(err); }
    };

    const handleDeleteLogistics = async (itemId) => {
        if (!window.confirm(`Delete logistics item?`)) return;
        try {
            const res = await fetch(`/api/logistics/${itemId}`, { method: 'DELETE' });
            if (res.ok) fetchAll();
        } catch (err) { console.error(err); }
    };

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

            {/* Edit Facility Info Form */}
            {facilityInfo && (
                <GlowCard accent="default" className="p-6 mb-6">
                    <h3 className="text-lg font-black text-white uppercase tracking-widest mb-4 border-b border-white/10 pb-2">
                        Edit Facility Details
                    </h3>
                    <form onSubmit={handleEditFacility} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-slate-400 text-[10px] uppercase mb-1">Name</label>
                            <input name="name" defaultValue={facilityInfo.name} required className="w-full bg-black/50 border border-white/10 rounded p-2 text-white text-sm" />
                        </div>
                        <div>
                            <label className="block text-slate-400 text-[10px] uppercase mb-1">Type</label>
                            <select name="type" defaultValue={facilityInfo.type} className="w-full bg-black/50 border border-white/10 rounded p-2 text-white text-sm">
                                <option value="PHC">PHC</option>
                                <option value="CHC">CHC</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-slate-400 text-[10px] uppercase mb-1">Location</label>
                            <input name="location" defaultValue={facilityInfo.location} required className="w-full bg-black/50 border border-white/10 rounded p-2 text-white text-sm" />
                        </div>
                        <div>
                            <label className="block text-slate-400 text-[10px] uppercase mb-1">Total Beds</label>
                            <div className="flex gap-2">
                                <input name="total_beds" type="number" defaultValue={facilityInfo.total_beds} required className="w-full bg-black/50 border border-white/10 rounded p-2 text-white text-sm" />
                                <button type="submit" className="bg-neon-cyan/20 text-neon-cyan px-4 rounded hover:bg-neon-cyan/30 text-xs font-bold uppercase tracking-wider">Save</button>
                            </div>
                        </div>
                    </form>
                </GlowCard>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 1. Staff Directory (Granular Delete) */}
                <GlowCard accent="cyan" className="p-6">
                    <h3 className="text-lg font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-white/10 pb-2">
                        <Users size={20} className="text-neon-cyan" />
                        Registered Staff
                    </h3>
                    <div className="space-y-3">
                        {staff.length === 0 ? <p className="text-slate-500 text-xs">No staff registered to this center.</p> : staff.map(u => (
                            <div key={u.username} className="bg-black/40 border border-white/5 p-3 rounded-lg flex justify-between items-center group hover:border-white/20 transition-colors">
                                <div>
                                    <p className="text-sm font-bold text-white">{u.username}</p>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Role: {u.role}</p>
                                </div>
                                <div>
                                    <button 
                                        onClick={() => handleDeleteStaff(u.username)}
                                        className="p-2 opacity-0 group-hover:opacity-100 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded hover:bg-rose-500/20 transition-all"
                                        title="Delete Staff"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </GlowCard>

                {/* 2. Ambulances / Transport (Granular Delete) */}
                <GlowCard accent="purple" className="p-6">
                    <h3 className="text-lg font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-white/10 pb-2">
                        <Truck size={20} className="text-neon-purple" />
                        Ambulance Fleet
                    </h3>
                    
                    <form onSubmit={handleAddAmbulance} className="flex gap-2 mb-4 bg-black/30 p-2 rounded border border-white/5">
                        <input name="name" required placeholder="Name (e.g. A1 ALS)" className="flex-1 bg-black/50 border border-white/10 rounded p-1.5 text-xs text-white" />
                        <select name="status" className="bg-black/50 border border-white/10 rounded p-1.5 text-xs text-white">
                            <option value="Available">Available</option>
                            <option value="Deployed">Deployed</option>
                            <option value="Maintenance">Maintenance</option>
                        </select>
                        <input name="fuel" type="number" required placeholder="Fuel %" className="w-20 bg-black/50 border border-white/10 rounded p-1.5 text-xs text-white" />
                        <button type="submit" className="bg-neon-purple/20 text-neon-purple px-3 rounded hover:bg-neon-purple/30 text-[10px] font-bold uppercase tracking-wider">Add</button>
                    </form>

                    <div className="space-y-3">
                        {!logistics?.transport || logistics.transport.length === 0 ? <p className="text-slate-500 text-xs font-mono">No ambulances assigned.</p> : logistics.transport.map(item => (
                            <div key={item.id} className="bg-black/40 border border-white/5 p-3 rounded-lg flex justify-between items-center group hover:border-white/20 transition-colors">
                                <div>
                                    <p className="text-sm font-bold text-white">{item.name}</p>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono mt-1">Status: {item.status} • Fuel: {item.fuel_level}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`px-2 py-1 rounded text-[10px] font-mono uppercase font-bold tracking-wider ${item.status === 'Available' ? 'bg-neon-teal/20 text-neon-teal border border-neon-teal/50' : 'bg-rose-500/20 text-rose-400 border border-rose-500/50'}`}>
                                        {item.status}
                                    </span>
                                    <button 
                                        onClick={() => handleDeleteLogistics(item.id)}
                                        className="p-2 opacity-0 group-hover:opacity-100 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded hover:bg-rose-500/20 transition-all"
                                        title="Delete Ambulance"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </GlowCard>

                {/* Inventory Overview */}
                <GlowCard accent="cyan" className="p-6">
                    <h3 className="text-lg font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-white/10 pb-2">
                        <Package size={20} className="text-neon-cyan" />
                        Logistics & Inventory
                    </h3>
                    <div className="space-y-3">
                        {!logistics?.consumables || logistics.consumables.length === 0 ? <p className="text-slate-500 text-xs font-mono">No inventory tracked.</p> : logistics.consumables.slice(0, 5).map(item => (
                            <div key={item.id} className="bg-black/40 border border-white/5 p-3 rounded-lg flex justify-between items-center group hover:border-white/20 transition-colors">
                                <div>
                                    <p className="text-sm font-bold text-white">{item.name}</p>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">EXP: {item.expiry_date || 'N/A'}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="text-right">
                                        <p className="text-lg font-black text-neon-cyan">{item.quantity}</p>
                                        <p className="text-[10px] text-slate-500 uppercase">Stock</p>
                                    </div>
                                    <button 
                                        onClick={() => handleDeleteLogistics(item.id)}
                                        className="p-2 opacity-0 group-hover:opacity-100 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded hover:bg-rose-500/20 transition-all"
                                        title="Delete Inventory"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </GlowCard>

                {/* Equipment Status */}
                <GlowCard accent="purple" className="p-6">
                    <h3 className="text-lg font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-white/10 pb-2">
                        <AlertTriangle size={20} className="text-neon-purple" />
                        Medical Equipment
                    </h3>
                    <div className="space-y-3">
                        {!logistics?.equipment || logistics.equipment.length === 0 ? <p className="text-slate-500 text-xs font-mono">No equipment tracked.</p> : logistics.equipment.map(item => (
                            <div key={item.id} className="bg-black/40 border border-white/5 p-3 rounded-lg flex justify-between items-center group hover:border-white/20 transition-colors">
                                <div>
                                    <p className="text-sm font-bold text-white">{item.name}</p>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono mt-1">Serviced: {item.last_serviced_date || 'Unknown'}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`px-2 py-1 rounded text-[10px] font-mono uppercase font-bold tracking-wider ${item.status === 'Functional' ? 'bg-neon-teal/20 text-neon-teal border border-neon-teal/50' : 'bg-rose-500/20 text-rose-400 border border-rose-500/50'}`}>
                                        {item.status}
                                    </span>
                                    <button 
                                        onClick={() => handleDeleteLogistics(item.id)}
                                        className="p-2 opacity-0 group-hover:opacity-100 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded hover:bg-rose-500/20 transition-all"
                                        title="Delete Equipment"
                                    >
                                        <Trash2 size={14} />
                                    </button>
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
