import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Hexagon, Lock } from 'lucide-react';
import { useAuth } from '../AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    const success = await login(username, password);
    if (success) {
        navigate('/dashboard');
    } else {
        setError('Invalid username or password');
    }
  };

  return (
    <div className="min-h-screen bg-cyber-bg flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background aesthetics */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEgMWgydjJIMUMxeiIgZmlsbD0icmdiYSgyNTUsIDI1NSwgMjU1LCAwLjAyKSIgZmlsbC1ydWxlPSJldmVub2RkIi8+PC9zdmc+')]"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-neon-cyan/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-8 rounded-2xl w-full max-w-md relative z-10 shadow-2xl">
        <div className="flex flex-col items-center mb-8 text-center">
          <Hexagon className="text-neon-cyan drop-shadow-[0_0_15px_rgba(6,182,212,0.5)] mb-4" size={56} />
          <h1 className="text-3xl font-black text-white tracking-widest uppercase mb-2">
            ArogyaNet <span className="text-neon-cyan">AI</span>
          </h1>
          <p className="text-slate-400 text-xs font-mono uppercase tracking-widest">Multi-Tenant Access System</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 mt-8">
          {error && <div className="bg-rose-500/20 text-rose-400 border border-rose-500/50 p-3 rounded-lg text-sm text-center uppercase tracking-widest font-bold">{error}</div>}
          
          <div className="flex flex-wrap gap-2 mb-6">
              <button 
                  type="button" 
                  onClick={() => { setUsername('admin'); setPassword('password'); }}
                  className={`flex-1 py-2 px-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest rounded-lg border transition-colors ${username === 'admin' ? 'bg-neon-cyan/20 text-neon-cyan border-neon-cyan/50' : 'bg-black/40 text-slate-400 border-white/10 hover:border-white/30'}`}
              >
                  Admin
              </button>
              <button 
                  type="button" 
                  onClick={() => { setUsername('phc-north'); setPassword('password'); }}
                  className={`flex-1 py-2 px-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest rounded-lg border transition-colors ${username === 'phc-north' ? 'bg-neon-purple/20 text-neon-purple border-neon-purple/50' : 'bg-black/40 text-slate-400 border-white/10 hover:border-white/30'}`}
              >
                  Staff
              </button>
              <button 
                  type="button" 
                  onClick={() => { setUsername('mla_user'); setPassword('password'); }}
                  className={`flex-1 py-2 px-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest rounded-lg border transition-colors ${username === 'mla_user' ? 'bg-neon-teal/20 text-neon-teal border-neon-teal/50' : 'bg-black/40 text-slate-400 border-white/10 hover:border-white/30'}`}
              >
                  MLA/MP
              </button>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Username</label>
            <input 
               type="text" 
               value={username} 
               onChange={(e) => setUsername(e.target.value)}
               className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-neon-cyan transition-colors"
               required 
            />
          </div>
          
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Password</label>
            <input 
               type="password" 
               value={password} 
               onChange={(e) => setPassword(e.target.value)}
               className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-neon-cyan transition-colors"
               required 
            />
          </div>

          <button type="submit" className="w-full bg-neon-cyan/20 hover:bg-neon-cyan/30 border border-neon-cyan/50 text-neon-cyan font-bold uppercase tracking-widest py-4 rounded-lg transition-colors flex items-center justify-center gap-3 shadow-[0_0_15px_rgba(6,182,212,0.2)] mt-6">
             <Lock size={20} />
             Secure Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
