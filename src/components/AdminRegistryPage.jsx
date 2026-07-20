import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { ShieldCheck, UserPlus, Building2, Plus, Trash2, ArrowRight } from 'lucide-react';
import GlowCard from './ui/GlowCard';
import { useNavigate } from 'react-router-dom';

const AdminRegistryPage = () => {
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';
    const navigate = useNavigate();

    const [facMsg, setFacMsg] = useState('');
    const [usrMsg, setUsrMsg] = useState('');
    
    const [facilities, setFacilities] = useState([]);
    const [loading, setLoading] = useState(true);

    if (!isAdmin) {
        return <div className="text-center py-20 text-rose-500 font-black uppercase tracking-widest">Access Denied</div>;
    }

    const fetchData = async () => {
        setLoading(true);
        try {
            const facRes = await fetch(`/api/district/facilities`);
            if (facRes.ok) setFacilities(await facRes.json());
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleRegisterFacility = async (e) => {
        e.preventDefault();
        const form = e.target;
        const payload = {
            id: form.id.value,
            name: form.name.value,
            type: form.type.value,
            location: form.location.value,
            total_beds: parseInt(form.total_beds.value),
            ambulance_strength: parseInt(form.ambulance_strength.value),
            doctors_strength: parseInt(form.doctors_strength.value),
            nurses_strength: parseInt(form.nurses_strength.value)
        };

        try {
            const res = await fetch(`/api/facilities/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                setFacMsg('Facility Registered Successfully!');
                form.reset();
                fetchData();
            } else {
                setFacMsg('Registration Failed');
            }
        } catch (err) { setFacMsg('Server Error'); }
    };

    const handleRegisterUser = async (e) => {
        e.preventDefault();
        const form = e.target;
        const payload = {
            username: form.username.value,
            password: form.password.value,
            role: form.role.value,
            center_id: form.center_id.value
        };

        try {
            const res = await fetch(`/api/users/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                setUsrMsg('User Credentials Created!');
                form.reset();
            } else {
                setUsrMsg('Registration Failed');
            }
        } catch (err) { setUsrMsg('Server Error'); }
    };

    const handleDeleteFacility = async (id) => {
        if (!window.confirm(`WARNING: You are about to permanently delete ${id} and all associated staff, patients, inventory, and logs. This cannot be undone.\n\nType 'DELETE' to confirm.`)) return;
        
        try {
            const res = await fetch(`/api/facilities/${id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                fetchData();
            } else {
                alert('Failed to delete facility.');
            }
        } catch (err) { console.error(err); }
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-10 font-sans">
            <h1 className="text-2xl font-black text-white uppercase tracking-widest mb-6">Admin Registry</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 1. Facility Registration */}
                <GlowCard accent="cyan" className="p-6">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2 border-b border-white/10 pb-4">
                        <Building2 size={24} className="text-neon-cyan" />
                        Register New Facility
                    </h2>
                    {facMsg && <p className="mb-4 text-neon-cyan text-xs font-bold uppercase">{facMsg}</p>}
                    
                    <form onSubmit={handleRegisterFacility} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-slate-400 text-[10px] uppercase mb-1">Center ID</label>
                                <input name="id" required className="w-full bg-black/50 border border-white/10 rounded p-2 text-white text-sm" placeholder="e.g. PHC-NORTH" />
                            </div>
                            <div>
                                <label className="block text-slate-400 text-[10px] uppercase mb-1">Type</label>
                                <select name="type" className="w-full bg-black/50 border border-white/10 rounded p-2 text-white text-sm">
                                    <option value="PHC">PHC</option>
                                    <option value="CHC">CHC</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-slate-400 text-[10px] uppercase mb-1">Full Name</label>
                            <input name="name" required className="w-full bg-black/50 border border-white/10 rounded p-2 text-white text-sm" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-slate-400 text-[10px] uppercase mb-1">Location/District</label>
                                <input name="location" required className="w-full bg-black/50 border border-white/10 rounded p-2 text-white text-sm" />
                            </div>
                            <div>
                                <label className="block text-slate-400 text-[10px] uppercase mb-1">Total Beds</label>
                                <input name="total_beds" type="number" required defaultValue="0" className="w-full bg-black/50 border border-white/10 rounded p-2 text-white text-sm" />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-slate-400 text-[10px] uppercase mb-1">Ambulances</label>
                                <input name="ambulance_strength" type="number" required defaultValue="0" className="w-full bg-black/50 border border-white/10 rounded p-2 text-white text-sm" />
                            </div>
                            <div>
                                <label className="block text-slate-400 text-[10px] uppercase mb-1">Doctors Strength</label>
                                <input name="doctors_strength" type="number" required defaultValue="5" className="w-full bg-black/50 border border-white/10 rounded p-2 text-white text-sm" />
                            </div>
                            <div>
                                <label className="block text-slate-400 text-[10px] uppercase mb-1">Nurses Strength</label>
                                <input name="nurses_strength" type="number" required defaultValue="10" className="w-full bg-black/50 border border-white/10 rounded p-2 text-white text-sm" />
                            </div>
                        </div>

                        <button type="submit" className="w-full py-2 bg-neon-cyan/20 text-neon-cyan font-bold text-xs uppercase tracking-widest rounded hover:bg-neon-cyan/30 transition-colors flex items-center justify-center gap-2 mt-4">
                            <Plus size={16} /> Register Facility
                        </button>
                    </form>
                </GlowCard>

                {/* 2. User Credentials */}
                <GlowCard accent="purple" className="p-6 flex flex-col">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2 border-b border-white/10 pb-4">
                        <UserPlus size={24} className="text-neon-purple" />
                        Create User Credentials
                    </h2>
                    {usrMsg && <p className="mb-4 text-neon-purple text-xs font-bold uppercase">{usrMsg}</p>}
                    
                    <form onSubmit={handleRegisterUser} className="space-y-4 flex-grow flex flex-col justify-between">
                        <div>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-slate-400 text-[10px] uppercase mb-1">Username</label>
                                    <input name="username" required className="w-full bg-black/50 border border-white/10 rounded p-2 text-white text-sm" />
                                </div>
                                <div>
                                    <label className="block text-slate-400 text-[10px] uppercase mb-1">Password</label>
                                    <input name="password" type="password" required className="w-full bg-black/50 border border-white/10 rounded p-2 text-white text-sm" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-slate-400 text-[10px] uppercase mb-1">Role</label>
                                    <select name="role" className="w-full bg-black/50 border border-white/10 rounded p-2 text-white text-sm">
                                        <option value="staff">Staff</option>
                                        <option value="admin">Admin</option>
                                        <option value="mla">MLA/Observer</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-slate-400 text-[10px] uppercase mb-1">Center Assignment</label>
                                    <select name="center_id" className="w-full bg-black/50 border border-white/10 rounded p-2 text-white text-sm">
                                        <option value="">-- Global/None --</option>
                                        {facilities.map(f => (
                                            <option key={f.id} value={f.id}>{f.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <button type="submit" className="w-full py-2 bg-neon-purple/20 text-neon-purple font-bold text-xs uppercase tracking-widest rounded hover:bg-neon-purple/30 transition-colors flex items-center justify-center gap-2 mt-4">
                            <ShieldCheck size={16} /> Create User
                        </button>
                    </form>
                </GlowCard>
            </div>

            {/* 3. Facility Dashboard */}
            <GlowCard accent="rose" className="mt-8 p-6">
                <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Building2 size={24} className="text-rose-400" />
                        Facility Management Dashboard
                    </h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {facilities.map(fac => (
                        <div key={fac.id} className="bg-black/50 border border-white/10 rounded-lg p-5 flex flex-col group hover:border-white/20 transition-colors">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-black text-white">{fac.id}</h3>
                                    <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">{fac.name}</p>
                                </div>
                                <span className={`px-2 py-1 rounded text-[10px] font-mono font-bold ${fac.type === 'PHC' ? 'bg-neon-teal/20 text-neon-teal' : 'bg-neon-purple/20 text-neon-purple'}`}>
                                    {fac.type}
                                </span>
                            </div>
                            
                            <div className="text-xs font-mono text-slate-300 space-y-1 mb-6 flex-grow">
                                <p><span className="text-slate-500">Loc:</span> {fac.location}</p>
                                <p><span className="text-slate-500">Beds:</span> {fac.total_beds}</p>
                            </div>

                            <div className="flex gap-2 mt-auto">
                                <button 
                                    onClick={() => navigate(`/facility/${fac.id}`)}
                                    className="flex-1 py-2 bg-white/5 text-white border border-white/10 rounded hover:bg-white/10 transition-colors text-[10px] font-bold uppercase tracking-widest flex justify-center items-center gap-1"
                                >
                                    Manage <ArrowRight size={12}/>
                                </button>
                                <button 
                                    onClick={() => handleDeleteFacility(fac.id)}
                                    className="p-2 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded hover:bg-rose-500/20 transition-colors"
                                    title="Delete Facility (Cascading)"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                    {facilities.length === 0 && !loading && (
                        <p className="text-slate-500 font-mono col-span-full">No facilities registered.</p>
                    )}
                </div>
            </GlowCard>
        </div>
    );
};

export default AdminRegistryPage;
