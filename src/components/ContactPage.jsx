import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, Loader2, Globe, User } from 'lucide-react';
import GlowCard from './ui/GlowCard';
import { useCitizenAuth } from '../CitizenAuthContext';
import { useLanguage } from '../LanguageContext';
import { Link, useNavigate } from 'react-router-dom';

const ContactPage = () => {
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('');
    const { citizenUser } = useCitizenAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!citizenUser) {
            navigate('/signin');
            return;
        }
        setLoading(true);
        setStatus('');
        try {
            const res = await fetch('/api/public/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (data.success) {
                setStatus('success');
                setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
            } else {
                setStatus('error');
            }
        } catch (err) {
            setStatus('error');
        }
        setLoading(false);
    };

    return (
        <div className="w-full bg-slate-950 min-h-screen pt-32 pb-24 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-neon-cyan/5 blur-[150px] rounded-full"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-neon-purple/5 blur-[150px] rounded-full"></div>

            <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">{t('contact_title')} <span className="text-neon-cyan">ArogyaNet AI</span></h1>
                    <p className="text-slate-400 text-lg leading-relaxed">
                        {t('contact_desc')}
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    
                    {/* Left Column: Form */}
                    <div className="lg:col-span-2">
                        <GlowCard className="p-8">
                            <h3 className="text-2xl font-bold text-white mb-6">{t('contact_form_title')}</h3>
                            
                            {status === 'success' && (
                                <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 text-green-400 rounded-xl">
                                    {t('contact_success')}
                                </div>
                            )}
                            
                            {status === 'error' && (
                                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl">
                                    {t('contact_error')}
                                </div>
                            )}

                            {!citizenUser && (
                                <div className="mb-6 p-4 bg-orange-500/10 border border-orange-500/30 text-orange-400 rounded-xl text-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <span>{t('contact_signin_msg')}</span>
                                    <Link to="/signin" className="px-4 py-1.5 bg-orange-500 hover:bg-orange-400 text-black font-bold rounded-lg transition-colors whitespace-nowrap">{t('contact_signin_btn')}</Link>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{t('contact_name')}</label>
                                        <input 
                                            type="text" required
                                            value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                                            className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-neon-cyan transition-colors"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{t('contact_email')}</label>
                                        <input 
                                            type="email" required
                                            value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                                            className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-neon-cyan transition-colors"
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{t('contact_phone')}</label>
                                        <input 
                                            type="tel" 
                                            value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                                            className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-neon-cyan transition-colors"
                                            placeholder="+91 98765 43210"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{t('contact_subject')}</label>
                                        <input 
                                            type="text" required
                                            value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})}
                                            className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-neon-cyan transition-colors"
                                            placeholder="How can we help?"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{t('contact_message')}</label>
                                    <textarea 
                                        required rows="5"
                                        value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})}
                                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-neon-cyan transition-colors resize-none"
                                        placeholder="Write your message here..."
                                    ></textarea>
                                </div>
                                <button 
                                    type="submit" disabled={loading}
                                    className="px-8 py-4 rounded-xl bg-neon-cyan hover:bg-cyan-400 text-slate-900 font-bold flex items-center justify-center gap-2 transition-all w-full md:w-auto"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={20}/> : <><Send size={20}/> {t('contact_send_btn')}</>}
                                </button>
                            </form>
                        </GlowCard>
                    </div>

                    {/* Right Column: Founder & Info */}
                    <div className="space-y-8">
                        <GlowCard accent="cyan" className="p-8">
                            <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-neon-cyan flex items-center justify-center mb-6 overflow-hidden">
                                <User className="text-slate-400" size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-1">Jayanth Ananthakrishnan</h3>
                            <p className="text-neon-cyan text-sm font-bold uppercase tracking-widest mb-4">{t('contact_founder')}</p>
                            <p className="text-slate-400 text-sm leading-relaxed mb-6">
                                {t('contact_founder_desc')}
                            </p>
                            <a 
                                href="https://www.linkedin.com/in/jayanth-ananthakrishnan-609269306" 
                                target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
                            >
                                <Globe size={20} className="text-[#0a66c2]" /> {t('contact_linkedin')}
                            </a>
                        </GlowCard>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;
