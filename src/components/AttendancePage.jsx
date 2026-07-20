import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { Users, CheckCircle2, AlertTriangle, Plus, ClipboardList, Settings2, Save, Trash2 } from 'lucide-react';
import GlowCard from './ui/GlowCard';

const AttendancePage = () => {
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('roster');

    // Admin Strength State
    const [strengthData, setStrengthData] = useState({});
    const [facilities, setFacilities] = useState([]);
    const [registeredUsers, setRegisteredUsers] = useState([]);

    const [activeCenter, setActiveCenter] = useState(user?.center_id || 'PHC-NORTH');

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/attendance/${activeCenter}`);
            const data = await res.json();
            setLogs(Array.isArray(data) ? data : []);

            const uRes = await fetch(`/api/users`);
            const uData = await uRes.json();
            if (Array.isArray(uData)) {
                setRegisteredUsers(uData.filter(u => u.center_id === activeCenter));
            }

            if (isAdmin) {
                const facRes = await fetch(`/api/district/surveillance`); // Borrow facilities list
                setFacilities(await facRes.json());
                const strRes = await fetch(`/api/strength`);
                setStrengthData(await strRes.json());
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [activeCenter, user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const form = e.target;
        const payload = {
            center_id: activeCenter,
            staff_name: form.staff_name.value,
            role: form.role.value,
            status: form.status.value,
            duty_hours: parseInt(form.duty_hours.value),
            leaves: parseInt(form.leaves.value),
            overtime: parseInt(form.overtime.value),
            department: form.department.value,
            patients_treated: parseInt(form.patients_treated.value)
        };

        try {
            await fetch(`/api/attendance/log`, {
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

    const handleUpdateStrength = async (e, center_id) => {
        e.preventDefault();
        const form = e.target;
        const role = form.role.value;
        const count = parseInt(form.count.value);
        try {
            await fetch(`/api/strength/update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ center_id, role, count })
            });
            fetchLogs();
            form.reset();
        } catch (err) { console.error(err); }
    };

    const handleDeleteStrength = async (center_id, role) => {
        try {
            await fetch(`/api/strength/delete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ center_id, role })
            });
            fetchLogs();
        } catch (err) { console.error(err); }
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-10 font-sans">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-widest flex items-center gap-3">
                        <Users className="text-neon-cyan drop-shadow-glow-cyan" />
                        Staff Attendance
                    </h2>
                    <p className="text-slate-400 text-xs font-mono uppercase tracking-widest mt-1">Doctor Roster & Performance</p>
                </div>
            </div>

            {isAdmin && (
                <div className="flex space-x-2 border-b border-white/10 pb-4 mb-6">
                    <button onClick={() => setActiveTab('roster')} className={`flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-bold uppercase tracking-widest transition-all ${activeTab === 'roster' ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/50 shadow-glow-cyan' : 'text-slate-400 hover:bg-white/5'}`}>Staff Roster Logs</button>
                    <button onClick={() => setActiveTab('strength')} className={`flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-bold uppercase tracking-widest transition-all ${activeTab === 'strength' ? 'bg-neon-purple/20 text-neon-purple border border-neon-purple/50 shadow-glow-purple' : 'text-slate-400 hover:bg-white/5'}`}>Sanctioned Strength Config</button>
                </div>
            )}

            {activeTab === 'roster' ? (
                <div className="space-y-4">
                    {isAdmin && facilities.length > 0 && (
                        <div className="flex items-center gap-4 bg-black/40 border border-white/10 p-4 rounded-lg">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select Facility:</label>
                            <select 
                                value={activeCenter} 
                                onChange={(e) => setActiveCenter(e.target.value)}
                                className="bg-black/60 border border-white/20 rounded-lg px-4 py-2 text-sm font-bold text-white outline-none focus:border-neon-cyan cursor-pointer"
                            >
                                {facilities.map(fac => (
                                    <option key={fac.id} value={fac.id}>{fac.id} - {fac.name}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    <div className={`grid grid-cols-1 ${!isAdmin ? 'lg:grid-cols-3' : 'lg:grid-cols-1'} gap-6`}>
                    {/* Input Form (Staff Only) */}
                    {!isAdmin && (
                        <GlowCard accent="cyan" className="p-6">
                            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2 border-b border-white/10 pb-4">
                                <Plus size={18} className="text-neon-cyan" />
                                Log Daily Roster
                            </h3>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Staff Name</label>
                                        <select name="staff_name" required className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-neon-cyan transition-colors appearance-none cursor-pointer">
                                            <option value="">Select Registered Staff...</option>
                                            {registeredUsers.map(u => (
                                                <option key={u.username} value={u.username}>{u.username} ({u.role})</option>
                                            ))}
                                            {registeredUsers.length === 0 && <option value="" disabled>No staff registered in this center</option>}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Role</label>
                                        <input name="role" type="text" required className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-neon-cyan transition-colors" placeholder="e.g. Doctor, Nurse, Compounder" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Department</label>
                                        <select name="department" className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-neon-cyan transition-colors cursor-pointer appearance-none">
                                            <option>General</option>
                                            <option>Pediatrics</option>
                                            <option>Surgery</option>
                                            <option>Emergency</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Status</label>
                                        <select name="status" className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-neon-cyan transition-colors cursor-pointer appearance-none">
                                            <option>Present</option>
                                            <option>Absent</option>
                                            <option>On Leave</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Duty Hours</label>
                                        <input name="duty_hours" type="number" required defaultValue={8} min={0} className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-neon-cyan" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Overtime (Hrs)</label>
                                        <input name="overtime" type="number" required defaultValue={0} min={0} className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-neon-cyan" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Leaves Taken</label>
                                        <input name="leaves" type="number" required defaultValue={0} min={0} className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-neon-cyan" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Patients Treated</label>
                                        <input name="patients_treated" type="number" required defaultValue={0} min={0} className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-neon-cyan" />
                                    </div>
                                </div>

                                <button type="submit" className="w-full mt-4 bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/40 hover:bg-neon-cyan/30 py-3 rounded-lg font-bold uppercase tracking-widest text-xs transition-all shadow-glow-cyan">
                                    Submit Roster Log
                                </button>
                            </form>
                        </GlowCard>
                    )}

                    {/* Historical Log */}
                    <GlowCard accent="default" className={`${!isAdmin ? 'lg:col-span-2' : 'lg:col-span-1'} p-6`}>
                        <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2 border-b border-white/10 pb-4">
                            <ClipboardList size={18} className="text-slate-400" />
                            Recent Attendance Logs
                        </h3>

                        <div className="space-y-4">
                            {loading ? (
                                <p className="text-slate-500 font-mono text-sm">Loading logs...</p>
                            ) : logs.length === 0 ? (
                                <p className="text-slate-500 font-mono text-sm">No attendance records found.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-white/10 text-[10px] uppercase tracking-widest text-slate-500">
                                                <th className="p-3 font-bold">Staff Name</th>
                                                <th className="p-3 font-bold">Role</th>
                                                <th className="p-3 font-bold">Dept</th>
                                                <th className="p-3 font-bold">Status</th>
                                                <th className="p-3 font-bold">Hrs</th>
                                                <th className="p-3 font-bold">OT</th>
                                                <th className="p-3 font-bold">Patients</th>
                                                <th className="p-3 font-bold">Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {logs.map((log) => (
                                                <tr key={log.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                                    <td className="p-3 text-sm font-bold text-slate-200">{log.staff_name}</td>
                                                    <td className="p-3 text-xs text-neon-cyan font-mono">{log.role}</td>
                                                    <td className="p-3 text-xs text-slate-400">{log.department}</td>
                                                    <td className="p-3">
                                                        <span className={`px-2 py-1 rounded text-[10px] font-mono uppercase font-bold ${log.status === 'Present' ? 'bg-neon-teal/20 text-neon-teal' : 'bg-rose-500/20 text-rose-400'}`}>
                                                            {log.status}
                                                        </span>
                                                    </td>
                                                    <td className="p-3 text-xs text-slate-300">{log.duty_hours}</td>
                                                    <td className="p-3 text-xs text-slate-300">{log.overtime}</td>
                                                    <td className="p-3 text-xs text-slate-300 font-bold">{log.patients_treated}</td>
                                                    <td className="p-3 text-[10px] text-slate-500 font-mono">{new Date(log.date).toLocaleDateString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </GlowCard>
                </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {facilities.map(fac => (
                        <GlowCard key={fac.id} accent="purple" className="p-6">
                            <h3 className="text-xl font-black text-white uppercase tracking-widest mb-4 flex justify-between items-center">
                                {fac.id}
                                <Settings2 size={20} className="text-neon-purple" />
                            </h3>

                            <div className="mb-6 bg-black/40 p-4 rounded-lg border border-white/5">
                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Current Sanctioned Strength</h4>
                                {strengthData[fac.id] && Object.keys(strengthData[fac.id]).length > 0 ? Object.entries(strengthData[fac.id]).map(([role, count]) => (
                                    <div key={role} className="flex justify-between items-center text-sm mb-2 group">
                                        <span className="text-slate-300 font-mono">{role}</span>
                                        <div className="flex items-center gap-3">
                                            <span className="text-neon-purple font-bold">{count}</span>
                                            <button
                                                onClick={() => handleDeleteStrength(fac.id, role)}
                                                className="text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                )) : <p className="text-xs text-slate-500 font-mono italic">No limits configured yet.</p>}
                            </div>

                            <form onSubmit={(e) => handleUpdateStrength(e, fac.id)} className="flex gap-2">
                                <input type="text" name="role" required placeholder="Role (e.g. Nurse)" className="flex-1 bg-black/50 border border-white/10 p-2 text-sm text-white rounded focus:border-neon-purple outline-none" />
                                <input type="number" name="count" required placeholder="Qty" min={0} className="w-20 bg-black/50 border border-white/10 p-2 text-sm text-white rounded focus:border-neon-purple outline-none" />
                                <button type="submit" className="bg-neon-purple/20 text-neon-purple border border-neon-purple/40 px-4 py-2 rounded font-bold uppercase text-xs hover:bg-neon-purple/30 transition-colors">Save</button>
                            </form>
                        </GlowCard>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AttendancePage;
