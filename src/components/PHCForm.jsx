import React, { useState } from 'react';
import { AlertCircle, Loader2, Database } from 'lucide-react';

const PHCForm = ({ onInsightGenerated }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const analyzeStock = async () => {
    setLoading(true);
    setError(null);

    try {
      // For the hackathon MVP, we mock querying for center_id = 1
      const response = await fetch(`/api/analyze-center/1`, {
        method: 'POST'
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch AI analysis from server.');
      }
      
      onInsightGenerated(data);
    } catch (err) {
      console.error(err);
      let errorMsg = 'An unexpected error occurred. Please verify the backend server is running.';
      if (err.message) errorMsg = err.message;
      setError(errorMsg);
      onInsightGenerated(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl h-full flex flex-col justify-center text-center items-center">
      <Database className="text-emerald-400 mb-4" size={48} />
      <h2 className="text-xl font-semibold mb-2 text-emerald-400">Autonomous AI Agent</h2>
      <p className="text-sm text-slate-400 mb-6 leading-relaxed">Click below to command Gemini to query the live Postgres Database, analyze the real-time inventory state, and autonomously generate alerts.</p>
      
      <button 
        className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold py-3 px-4 rounded-lg transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20 border border-emerald-400/20"
        onClick={analyzeStock} 
        disabled={loading}
      >
        {loading ? (
          <><Loader2 className="animate-spin" size={20} /> Querying Live DB...</>
        ) : (
          'Run Autonomous DB Analysis'
        )}
      </button>

      {error && (
        <div className="mt-4 w-full bg-rose-500/10 border border-rose-500/20 rounded-lg p-4 flex gap-3 text-rose-400 items-start text-left">
          <AlertCircle className="shrink-0 mt-0.5" size={20} />
          <div className="text-sm">{error}</div>
        </div>
      )}
    </div>
  );
};

export default PHCForm;
