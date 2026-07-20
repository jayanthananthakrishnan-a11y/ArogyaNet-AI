import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCitizenAuth } from '../CitizenAuthContext';
import { Activity, Mail, Lock, ArrowRight } from 'lucide-react';
import GlowCard from './ui/GlowCard';

const CitizenLogin = () => {
    const [formData, setFormData] = useState({ identifier: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { loginCitizen } = useCitizenAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/public/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();

            if (data.success) {
                loginCitizen(data.token, data.user);
                navigate('/');
            } else {
                setError(data.error || 'Login failed');
            }
        } catch (err) {
            setError('Server error. Please try again.');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden px-4">
            <div className="absolute top-0 right-0 w-96 h-96 bg-neon-cyan/10 blur-[150px] rounded-full"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-neon-purple/10 blur-[150px] rounded-full"></div>

            <Link to="/" className="absolute top-8 left-8 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-cyan to-blue-600 flex items-center justify-center">
                    <Activity className="text-white" size={20} />
                </div>
                <span className="font-bold text-xl text-white">ArogyaNet <span className="text-neon-cyan">AI</span></span>
            </Link>

            <GlowCard className="w-full max-w-md p-8 relative z-10">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-white mb-2">Citizen Login</h2>
                    <p className="text-slate-400 text-sm">Welcome back to ArogyaNet AI.</p>
                </div>

                {error && <div className="p-3 mb-6 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Email or Phone</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input
                                type="text"
                                required
                                value={formData.identifier}
                                onChange={e => setFormData({ ...formData, identifier: e.target.value })}
                                className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-neon-cyan transition-colors"
                                placeholder="Email or Phone Number"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input
                                type="password"
                                required
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-neon-cyan transition-colors"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-6 bg-neon-cyan hover:bg-cyan-400 text-slate-900 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? 'Logging in...' : 'Sign In'} <ArrowRight size={18} />
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-slate-400">
                    Don't have an account? <Link to="/signup" className="text-neon-cyan hover:underline">Sign Up</Link>
                </p>
            </GlowCard>
        </div>
    );
};

export default CitizenLogin;
