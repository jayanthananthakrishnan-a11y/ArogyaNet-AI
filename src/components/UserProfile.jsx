import React, { useState } from 'react';
import { useCitizenAuth } from '../CitizenAuthContext';
import { User, Mail, Phone, MapPin, Edit2, Save, X, Loader2 } from 'lucide-react';
import GlowCard from './ui/GlowCard';

const UserProfile = () => {
  const { citizenUser, loginCitizen } = useCitizenAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(citizenUser?.name || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSave = async () => {
    if (!name.trim()) return;
    setLoading(true);
    setMessage('');

    try {
      const token = sessionStorage.getItem('citizenToken');
      const res = await fetch('/api/public/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: name.trim() })
      });
      
      const data = await res.json();
      if (data.success) {
        setMessage('Profile updated successfully');
        setIsEditing(false);
        // Update local context manually or reload
        const updatedUser = { ...citizenUser, name: name.trim() };
        loginCitizen(token, updatedUser);
      } else {
        setMessage(data.error || 'Failed to update profile');
      }
    } catch (err) {
      setMessage('An error occurred while saving.');
    }
    setLoading(false);
  };

  if (!citizenUser) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <p className="text-slate-400">Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-950 min-h-screen pt-32 pb-24 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-neon-cyan/5 blur-[150px] rounded-full"></div>
      
      <div className="max-w-3xl mx-auto px-4 relative z-10">
        <h1 className="text-3xl font-black text-white mb-8 tracking-tight flex items-center gap-3">
          <User className="text-neon-cyan" size={32} />
          My Profile
        </h1>

        {message && (
          <div className={`p-4 mb-6 rounded-xl border text-sm ${message.includes('successfully') ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
            {message}
          </div>
        )}

        <GlowCard className="p-8">
          <div className="space-y-8">
            
            {/* Name section (Editable) */}
            <div className="border-b border-white/10 pb-6">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Full Name</label>
              
              {isEditing ? (
                <div className="flex items-center gap-3">
                  <input 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    className="flex-1 bg-slate-900/80 border border-neon-cyan/50 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-1 focus:ring-neon-cyan transition-all"
                    autoFocus
                  />
                  <button 
                    onClick={handleSave} 
                    disabled={loading || !name.trim()}
                    className="p-3 bg-neon-cyan hover:bg-cyan-400 text-slate-900 rounded-xl transition-colors disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                  </button>
                  <button 
                    onClick={() => { setIsEditing(false); setName(citizenUser.name); }}
                    className="p-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-white">{citizenUser.name}</span>
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-bold transition-colors text-slate-300 hover:text-white"
                  >
                    <Edit2 size={14} /> Edit
                  </button>
                </div>
              )}
            </div>

            {/* Email (Readonly) */}
            <div className="border-b border-white/10 pb-6">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Email Address</label>
              <div className="flex items-center gap-3 text-slate-300">
                <Mail size={18} className="text-slate-500" />
                <span>{citizenUser.email}</span>
                <span className="ml-auto text-xs bg-white/5 px-2 py-1 rounded text-slate-500">Unchangeable</span>
              </div>
            </div>

            {/* Phone (Readonly) */}
            <div className="border-b border-white/10 pb-6">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Phone Number</label>
              <div className="flex items-center gap-3 text-slate-300">
                <Phone size={18} className="text-slate-500" />
                <span>{citizenUser.phone_number || citizenUser.phone}</span>
                <span className="ml-auto text-xs bg-white/5 px-2 py-1 rounded text-slate-500">Unchangeable</span>
              </div>
            </div>

            {/* State (Readonly) */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Registered State</label>
              <div className="flex items-center gap-3 text-slate-300">
                <MapPin size={18} className="text-slate-500" />
                <span>{citizenUser.state || 'India'}</span>
                <span className="ml-auto text-xs bg-white/5 px-2 py-1 rounded text-slate-500">Unchangeable</span>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="pt-8 mt-8 border-t border-red-500/20">
              <h3 className="text-red-400 font-bold mb-4 flex items-center gap-2">Danger Zone</h3>
              <p className="text-slate-400 text-sm mb-4">Once you delete your account, there is no going back. Please be certain.</p>
              <button 
                onClick={async () => {
                  if (window.confirm("Are you sure you want to permanently delete your account? This action cannot be undone.")) {
                    const token = sessionStorage.getItem('citizenToken');
                    try {
                      await fetch('/api/public/profile', {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${token}` }
                      });
                      // If success or even if fail, log them out locally to drop session
                      loginCitizen(null, null);
                      window.location.href = '/';
                    } catch (e) {
                      setMessage("Failed to delete account");
                    }
                  }
                }}
                className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg text-sm font-bold transition-colors"
              >
                Delete Account
              </button>
            </div>
          </div>
        </GlowCard>
      </div>
    </div>
  );
};

export default UserProfile;
