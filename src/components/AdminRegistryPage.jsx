import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { ShieldCheck, UserPlus, Building2, Plus } from 'lucide-react';
import GlowCard from './ui/GlowCard';

const AdminRegistryPage = () => {
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';

    const [facMsg, setFacMsg] = useState('');
    const [usrMsg, setUsrMsg] = useState('');

    if (!isAdmin) {
        return <div className="text-center py-20 text-rose-500 font-black uppercase tracking-widest">Access Denied</div>;
  }

  const handleRegisterFacility = async (e) => {
      e.preventDefault();
      const form = e.target;
      const payload = {
          id: form.id.value,
          name: form.name.value,
          type: form.type.value,
          location: form.location.value,
          total_beds: parseInt(form.total_beds.value),
          ambulance_strength: parseInt(form.ambulance_strength.value)
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10 font-sans">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-widest flex items-center gap-3">
                        <ShieldCheck className="text-neon-teal drop-shadow-glow-teal" />
                        Admin Registry
                    </h2>
                    <p className="text-slate-400 text-xs font-mono uppercase tracking-widest mt-1">Facility & Access Management</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Facility Registration Form */}
                <GlowCard accent="cyan" className="p-6">
                    <h3 className="text-lg font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2 border-b border-white/10 pb-4">
                        <Building2 size={20} className="text-neon-cyan" />
                        Register New Facility
                    </h3>

                    {facMsg && <div className="mb-4 text-xs font-bold uppercase tracking-widest text-neon-cyan bg-neon-cyan/10 p-2 rounded">{facMsg}</div>}

                    <form onSubmit={handleRegisterFacility} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Center ID</label>
                                <input name="id" type="text" required placeholder="e.g. PHC-SOUTH" className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white focus:border-neon-cyan outline-none" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Type</label>
                                <select name="type" className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white focus:border-neon-cyan outline-none">
                                    <option>PHC</option>
                                    <option>CHC</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Full Name</label>
                            <input name="name" type="text" required placeholder="e.g. Primary Health Center (South)" className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white focus:border-neon-cyan outline-none" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Location/District</label>
                            <input name="location" type="text" required placeholder="e.g. South Block" className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white focus:border-neon-cyan outline-none" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Total Beds</label>
                                <input name="total_beds" type="number" required min={0} defaultValue={0} className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white focus:border-neon-cyan outline-none" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Ambulance Strength</label>
                                <input name="ambulance_strength" type="number" required min={0} defaultValue={0} className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white focus:border-neon-cyan outline-none" />
                            </div>
                        </div>
                        <button type="submit" className="w-full mt-4 bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/40 px-4 py-3 rounded-lg font-bold uppercase text-xs hover:bg-neon-cyan/30 transition-colors flex items-center justify-center gap-2">
                            <Plus size={16} /> Register Facility
                        </button>
                    </form>
                </GlowCard>

                {/* User Registration Form */}
                <GlowCard accent="purple" className="p-6">
                    <h3 className="text-lg font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2 border-b border-white/10 pb-4">
                        <UserPlus size={20} className="text-neon-purple" />
                        Create User Credentials
                    </h3>

                    {usrMsg && <div className="mb-4 text-xs font-bold uppercase tracking-widest text-neon-purple bg-neon-purple/10 p-2 rounded">{usrMsg}</div>}

                    <form onSubmit={handleRegisterUser} className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Username</label>
                            <input name="username" type="text" required placeholder="e.g. jsmith" className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white focus:border-neon-purple outline-none" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Password</label>
                            <input name="password" type="password" required className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white focus:border-neon-purple outline-none" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Role</label>
                                <select name="role" className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white focus:border-neon-purple outline-none">
                                    <option value="staff">Staff</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Center Assignment</label>
                                <input name="center_id" type="text" placeholder="e.g. PHC-SOUTH" className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white focus:border-neon-purple outline-none" />
                                <p className="text-[9px] text-slate-500 mt-1">Leave blank for Admins</p>
                            </div>
                        </div>
                        <button type="submit" className="w-full mt-4 bg-neon-purple/20 text-neon-purple border border-neon-purple/40 px-4 py-3 rounded-lg font-bold uppercase text-xs hover:bg-neon-purple/30 transition-colors flex items-center justify-center gap-2">
                            <Plus size={16} /> Create User
                        </button>
                    </form>
                </GlowCard>

            </div>
        </div>
  );
};

export default AdminRegistryPage;
