import React, { useState } from 'react';
import { ShieldAlert, Send, X, Loader2 } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { useLanguage } from '../LanguageContext';

const SOSModal = ({ isOpen, onClose }) => {
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { language } = useLanguage();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) return;

    setLoading(true);
    try {
      await fetch(`/api/sos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          center_id: user?.center_id || 'UNKNOWN',
          description,
          language
        })
      });
      setDescription('');
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-black border border-rose-500/50 rounded-2xl w-full max-w-md overflow-hidden shadow-[0_0_50px_rgba(244,63,94,0.2)] animate-in fade-in zoom-in duration-300">
        <div className="bg-rose-500/10 p-6 flex justify-between items-start border-b border-rose-500/30">
          <div className="flex items-center gap-4">
            <div className="bg-rose-500/20 p-3 rounded-full text-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.4)] animate-pulse">
              <ShieldAlert size={28} />
            </div>
            <div>
              <h3 className="text-xl font-black text-rose-500 uppercase tracking-widest">Emergency SOS</h3>
              <p className="text-rose-400/80 text-xs mt-1">Send a high-priority alert to the District Admin and neighboring facilities.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
              Describe the Emergency
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="E.g., Major accident on Highway 4. Need 3 ALS ambulances and blood supply immediately..."
              className="w-full bg-black/40 border border-rose-500/30 rounded-xl p-4 text-sm text-white focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none resize-none min-h-[120px]"
              required
            />
          </div>

          <div className="flex gap-4">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-slate-800 text-slate-300 rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="flex-1 py-3 px-4 bg-rose-600 text-white rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-rose-500 transition-colors flex justify-center items-center gap-2 shadow-[0_0_20px_rgba(244,63,94,0.4)] disabled:opacity-50"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <><Send size={18} /> Broadcast SOS</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SOSModal;
