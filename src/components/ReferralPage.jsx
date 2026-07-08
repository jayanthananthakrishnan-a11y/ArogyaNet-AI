import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { useLanguage } from '../LanguageContext';
import GlowCard from './ui/GlowCard';
import { ArrowRightLeft, CheckCircle2, UserPlus, Activity, Bed } from 'lucide-react';

const ReferralPage = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [referrals, setReferrals] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const isPHC = user?.center_id?.startsWith('PHC');
  const isCHC = user?.center_id?.startsWith('CHC');

  const fetchReferrals = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/referrals/${user?.center_id}`);
      const data = await res.json();
      setReferrals(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFacilities = async () => {
    try {
      const res = await fetch('/api/district/facilities');
      const data = await res.json();
      // Only get CHCs for a PHC to refer to
      setFacilities(data.filter(f => f.type === 'CHC'));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (user?.center_id) {
      fetchReferrals();
      if (isPHC) fetchFacilities();
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const payload = {
      phc_id: user?.center_id,
      chc_id: form.chc_id.value,
      patient_name: form.patient_name.value,
      condition_desc: form.condition_desc.value
    };

    try {
      await fetch(`/api/referrals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      form.reset();
      fetchReferrals();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAccept = async (id, phc_id) => {
    try {
      const res = await fetch(`/api/referrals/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, phc_id, chc_id: user?.center_id })
      });
      const data = await res.json();
      if (data.success) {
        alert('Referral Accepted! AI has dynamically updated bed counts.');
        fetchReferrals();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10 font-sans">
      <div className="flex justify-between items-end mb-8">
         <div>
             <h2 className="text-2xl font-black text-white uppercase tracking-widest flex items-center gap-3">
                 <ArrowRightLeft className="text-neon-cyan drop-shadow-glow-cyan" />
                 {language === 'hi' ? 'रेफरल प्रबंधन' : 'Referral Management'}
             </h2>
             <p className="text-slate-400 text-xs font-mono uppercase tracking-widest mt-1">
                 {language === 'hi' ? 'स्मार्ट बेड आवंटन के साथ' : 'With AI-driven Bed Allocation'}
             </p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* If PHC: Show Submission Form */}
        {isPHC && (
          <GlowCard accent="cyan" className="p-6">
              <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2 border-b border-white/10 pb-4">
                  <UserPlus size={18} className="text-neon-cyan" />
                  {language === 'hi' ? 'नया रेफरल' : 'New Referral'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Patient Name / ID</label>
                      <input name="patient_name" type="text" required className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-neon-cyan transition-colors" />
                  </div>
                  <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Target CHC</label>
                      <select name="chc_id" required className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-neon-cyan transition-colors cursor-pointer appearance-none">
                          <option value="">Select CHC...</option>
                          {facilities.map(fac => (
                              <option key={fac.id} value={fac.id}>{fac.name} ({fac.id})</option>
                          ))}
                      </select>
                  </div>
                  <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Condition Details</label>
                      <textarea name="condition_desc" required rows={3} placeholder="Requires ICU, Oxygen support..." className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-neon-cyan transition-colors resize-none"></textarea>
                  </div>
                  <button type="submit" className="w-full mt-4 bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/40 hover:bg-neon-cyan/30 py-3 rounded-lg font-bold uppercase tracking-widest text-xs transition-all shadow-glow-cyan">
                      Submit to CHC
                  </button>
              </form>
          </GlowCard>
        )}

        {/* History / Pending Queue */}
        <GlowCard accent="default" className={`p-6 ${isPHC ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2 border-b border-white/10 pb-4">
                <Activity size={18} className="text-slate-400" />
                {isCHC ? 'Pending Inbound Referrals' : 'Referral History'}
            </h3>

            {loading ? (
                <p className="text-slate-500 font-mono text-sm">Loading queue...</p>
            ) : referrals.length === 0 ? (
                <p className="text-slate-500 font-mono text-sm">No referrals found.</p>
            ) : (
                <div className="space-y-4">
                    {referrals.map((ref) => (
                        <div key={ref.id} className="bg-black/40 border border-white/5 rounded-xl p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="bg-white/10 text-slate-300 px-2 py-1 rounded text-[10px] font-mono font-bold">
                                        ID: {ref.id}
                                    </span>
                                    <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold tracking-widest ${ref.status === 'Accepted' ? 'bg-neon-teal/20 text-neon-teal border border-neon-teal/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
                                        {ref.status}
                                    </span>
                                </div>
                                <h4 className="text-sm font-bold text-white mb-1">{ref.patient_name}</h4>
                                <p className="text-xs text-slate-400 leading-relaxed mb-2 max-w-lg">{ref.condition_desc}</p>
                                <p className="text-[10px] text-slate-500 font-mono uppercase">
                                    {isCHC ? `From: ${ref.phc_id}` : `To: ${ref.chc_id}`} • {new Date(ref.created_at).toLocaleString()}
                                </p>
                            </div>
                            
                            {/* Action Button for CHC */}
                            {isCHC && ref.status === 'Pending' && (
                                <button onClick={() => handleAccept(ref.id, ref.phc_id)} className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-neon-teal bg-neon-teal/10 px-4 py-3 rounded-lg border border-neon-teal/30 hover:bg-neon-teal/20 transition-colors shrink-0">
                                   <CheckCircle2 size={16} />
                                   Accept & Update Beds
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </GlowCard>
      </div>
    </div>
  );
};

export default ReferralPage;
