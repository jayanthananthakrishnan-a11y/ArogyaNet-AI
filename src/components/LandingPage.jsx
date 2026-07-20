import React, { useState, useEffect } from 'react';
import { Search, ShieldAlert, Hospital, Hexagon, Activity, Users, Droplet, MapPin, X, BarChart2, Globe } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import GlowCard from './ui/GlowCard';
import { useLanguage } from '../LanguageContext';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import India from '@react-map/india';
import { motion } from 'framer-motion';
import AnimatedCounter from './ui/AnimatedCounter';

const FadeIn = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
  >
    {children}
  </motion.div>
);

const LandingPage = () => {
  const { t, language, toggleLanguage } = useLanguage();
  const location = window.location.search; // Simple way to check since we are using react-router-dom and could import useLocation, but window.location.search is fine too. Or let's import useLocation.
  const [activeTab, setActiveTab] = useState('national'); // 'national', 'state', 'local'
  
  // Data States
  const [nationalData, setNationalData] = useState(null);
  const [statesList, setStatesList] = useState([]);
  const [selectedState, setSelectedState] = useState('');
  const [stateData, setStateData] = useState(null);
  const [trendData, setTrendData] = useState([]);
  const [bloodBanks, setBloodBanks] = useState([]);
  const [stateProfileTab, setStateProfileTab] = useState('profile'); // 'profile' or 'trends'
  
  // Local Operational States (District Explorer)
  const [localSelectedState, setLocalSelectedState] = useState('');
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [localDistrictsData, setLocalDistrictsData] = useState([]);
  const [sampleDistricts, setSampleDistricts] = useState([]);
  const [selectedDistrictProfile, setSelectedDistrictProfile] = useState(null);

  useEffect(() => {
    // Fetch National Data
    const fetchInitialData = async () => {
      try {
        const [natRes, statesRes, bbRes] = await Promise.all([
            fetch('/api/public/national-overview'),
            fetch('/api/public/states-list'),
            fetch('/api/public/blood-banks')
        ]);
        const natData = await natRes.json();
        const sList = await statesRes.json();
        const bbData = await bbRes.json();
        
        setNationalData(natData);
        setStatesList(sList);
        setBloodBanks(bbData);

        // Fetch sample districts for the empty state dynamically from the first available state
        if (sList && sList.length > 0) {
            const firstState = sList[0];
            fetch(`/api/public/state/${encodeURIComponent(firstState)}`)
                .then(res => res.json())
                .then(data => setSampleDistricts(data.districts || []))
                .catch(err => console.error("Failed to fetch sample districts", err));
        }
      } catch (err) {
        console.error("Failed to fetch initial national data", err);
      }
    };
    fetchInitialData();
  }, []);

  const locationSearch = useLocation().search;
  useEffect(() => {
    const params = new URLSearchParams(locationSearch);
    if (params.get('tab') === 'state') {
        setActiveTab('state');
    } else if (params.get('tab') === 'local') {
        setActiveTab('local');
    } else {
        setActiveTab('national');
    }
  }, [locationSearch]);

  useEffect(() => {
    if (selectedState) {
        const fetchStateData = async () => {
            try {
                const [stateRes, trendsRes] = await Promise.all([
                    fetch(`/api/public/state/${encodeURIComponent(selectedState)}`),
                    fetch(`/api/public/trends/${encodeURIComponent(selectedState)}`)
                ]);
                const sData = await stateRes.json();
                const tData = await trendsRes.json();
                setStateData(sData);
                setTrendData(tData);
                console.log("Trend Data:", tData);
            } catch (err) {
                console.error("Failed to fetch state data or trends", err);
            }
        };
        fetchStateData();
    }
  }, [selectedState]);

  useEffect(() => {
    if (localSelectedState) {
        const fetchLocalStateData = async () => {
            try {
                const stateRes = await fetch(`/api/public/state/${encodeURIComponent(localSelectedState)}`);
                const sData = await stateRes.json();
                setLocalDistrictsData(sData.districts || []);
            } catch (err) {
                console.error("Failed to fetch state data for District Explorer", err);
            }
        };
        fetchLocalStateData();
    } else {
        setLocalDistrictsData([]);
    }
  }, [localSelectedState]);

  // Helper to safely format numbers
  const formatNum = (num) => {
    if (!num) return '0';
    return Number(num).toLocaleString('en-IN');
  };

  return (
    <div className="w-full font-sans relative overflow-hidden pt-24">
      {/* Background Cyber Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-neon-cyan/10 blur-[150px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-neon-purple/10 blur-[150px] rounded-full pointer-events-none"></div>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pb-24">
        
        {/* Navigation Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
            <button 
                onClick={() => setActiveTab('national')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-sm transition-all ${activeTab === 'national' ? 'bg-neon-cyan text-black shadow-glow-cyan' : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'}`}
            >
                <Globe size={18} /> {t('national_overview')}
            </button>
            <button 
                onClick={() => setActiveTab('state')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-sm transition-all ${activeTab === 'state' ? 'bg-neon-purple text-white shadow-glow-purple' : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'}`}
            >
                <MapPin size={18} /> {t('state_insights')}
            </button>
            <button 
                onClick={() => { setActiveTab('local'); setSelectedDistrictProfile(null); }}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-sm transition-all ${activeTab === 'local' ? 'bg-neon-teal text-black shadow-glow-cyan' : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'}`}
            >
                <Hospital size={18} /> {t('district_explorer')}
            </button>
        </div>

        {/* --- TAB: NATIONAL OVERVIEW --- */}
        {activeTab === 'national' && nationalData && (
            <div className="space-y-8 animate-in fade-in">
                <div className="text-center mb-10">
                    <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight mb-2">
                        {t('india_health_infrastructure')}
                    </h2>
                    <p className="text-slate-400 font-mono uppercase tracking-widest text-sm">{t('real_time_aggregated_data')}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <FadeIn delay={0.1}>
                        <GlowCard accent="cyan" className="p-6 text-center">
                            <Hospital className="mx-auto text-neon-cyan mb-4" size={32} />
                            <h3 className="text-3xl font-black text-white mb-1">
                                <AnimatedCounter value={nationalData.infrastructure?.total_phcs || 0} />
                            </h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('primary_health_centres')}</p>
                        </GlowCard>
                    </FadeIn>
                    <FadeIn delay={0.2}>
                        <GlowCard accent="purple" className="p-6 text-center">
                            <Activity className="mx-auto text-neon-purple mb-4" size={32} />
                            <h3 className="text-3xl font-black text-white mb-1">
                                <AnimatedCounter value={nationalData.infrastructure?.total_chcs || 0} />
                            </h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('community_health_centres')}</p>
                        </GlowCard>
                    </FadeIn>
                    <FadeIn delay={0.3}>
                        <GlowCard accent="pink" className="p-6 text-center">
                            <Users className="mx-auto text-pink-500 mb-4" size={32} />
                            <h3 className="text-3xl font-black text-white mb-1">
                                <AnimatedCounter value={nationalData.workforce?.total_allopathic || 0} />
                            </h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('govt_doctors')}</p>
                        </GlowCard>
                    </FadeIn>
                    <FadeIn delay={0.4}>
                        <GlowCard accent="red" className="p-6 text-center">
                            <Droplet className="mx-auto text-red-500 mb-4" size={32} />
                            <h3 className="text-3xl font-black text-white mb-1">
                                <AnimatedCounter value={Number(nationalData.bloodBanks?.public_banks || 0) + Number(nationalData.bloodBanks?.private_banks || 0)} />
                            </h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('licensed_blood_banks')}</p>
                        </GlowCard>
                    </FadeIn>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
                    <FadeIn delay={0.5}>
                    <GlowCard className="p-6 h-full">
                        <h3 className="text-lg font-bold text-white uppercase tracking-widest mb-6 border-b border-white/10 pb-4 flex items-center gap-2">
                            <BarChart2 className="text-neon-cyan"/> {t('infrastructure_breakdown')}
                        </h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={[
                                    { name: 'Sub Centres', count: Number(nationalData.infrastructure?.total_sub_centers) },
                                    { name: 'PHCs', count: Number(nationalData.infrastructure?.total_phcs) },
                                    { name: 'CHCs', count: Number(nationalData.infrastructure?.total_chcs) },
                                    { name: 'Dist. Hospitals', count: Number(nationalData.infrastructure?.total_dh) }
                                ]}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                    <XAxis dataKey="name" stroke="#888" tick={{fill: '#888', fontSize: 12}} />
                                    <YAxis stroke="#888" tick={{fill: '#888', fontSize: 12}} />
                                    <Tooltip contentStyle={{backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px'}} cursor={{fill: 'rgba(255,255,255,0.05)'}}/>
                                    <Bar dataKey="count" fill="#00f0ff" radius={[4, 4, 0, 0]} animationDuration={1500} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </GlowCard>
                    </FadeIn>

                    <FadeIn delay={0.6}>
                    <GlowCard className="p-6 h-full">
                        <h3 className="text-lg font-bold text-white uppercase tracking-widest mb-6 border-b border-white/10 pb-4 flex items-center gap-2">
                            <Hospital className="text-neon-cyan"/> {t('top_states_phcs')}
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/10 text-xs uppercase tracking-widest text-slate-500">
                                        <th className="p-3">{t('state_col')}</th>
                                        <th className="p-3 text-right">{t('total_phcs')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {nationalData.top_phcs?.map((row, idx) => (
                                        <tr key={idx} className="border-b border-white/5 hover:bg-white/5">
                                            <td className="p-3 text-sm font-bold text-white">{row.state}</td>
                                            <td className="p-3 text-sm font-mono text-neon-cyan text-right">{formatNum(row.total_phcs)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </GlowCard>
                    </FadeIn>
                    
                    <FadeIn delay={0.7}>
                    <GlowCard className="p-6">
                        <h3 className="text-lg font-bold text-white uppercase tracking-widest mb-6 border-b border-white/10 pb-4 flex items-center gap-2">
                            <Users className="text-pink-500"/> {t('top_states_doctors')}
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/10 text-xs uppercase tracking-widest text-slate-500">
                                        <th className="p-3">{t('state_col')}</th>
                                        <th className="p-3 text-right">{t('govt_doctors')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {nationalData.top_doctors?.map((row, idx) => (
                                        <tr key={idx} className="border-b border-white/5 hover:bg-white/5">
                                            <td className="p-3 text-sm font-bold text-white">{row.state}</td>
                                            <td className="p-3 text-sm font-mono text-pink-500 text-right">{formatNum(row.allopathic_doctors)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </GlowCard>
                    </FadeIn>

                    <FadeIn delay={0.8} className="md:col-span-2">
                    <GlowCard className="p-6">
                        <h3 className="text-lg font-bold text-white uppercase tracking-widest mb-6 border-b border-white/10 pb-4 flex items-center gap-2">
                            <Droplet className="text-red-500"/> {t('top_states_blood_banks')}
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/10 text-xs uppercase tracking-widest text-slate-500">
                                        <th className="p-3">{t('state_col')}</th>
                                        <th className="p-3">{t('public_banks')}</th>
                                        <th className="p-3">{t('private_banks')}</th>
                                        <th className="p-3">{t('total')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {nationalData.top_blood_banks?.map((bb, idx) => (
                                        <tr key={idx} className="border-b border-white/5 hover:bg-white/5">
                                            <td className="p-3 text-sm font-bold text-white">{bb.state}</td>
                                            <td className="p-3 text-sm text-slate-300">{bb.public_banks}</td>
                                            <td className="p-3 text-sm text-slate-300">{bb.private_banks}</td>
                                            <td className="p-3 text-sm font-mono text-neon-cyan">{bb.total}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </GlowCard>
                    </FadeIn>
                </div>
            </div>
        )}

        {/* --- TAB: STATE INSIGHTS --- */}
        {activeTab === 'state' && (
            <div className="space-y-8 animate-in fade-in">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-black text-white uppercase tracking-widest mb-2">
                        {t('state_health_infrastructure')}
                    </h2>
                    <p className="text-slate-400 font-mono uppercase tracking-widest text-sm">
                        {t('select_state_map')}
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    {/* Interactive Map Section */}
                    <div className="w-full lg:w-1/2 flex justify-center bg-black/50 border border-white/10 rounded-2xl p-4 shadow-2xl relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/5 to-transparent rounded-2xl pointer-events-none"></div>
                        <India 
                            type="select-single"
                            size={500}
                            mapColor="#1e293b"
                            strokeColor="#334155"
                            strokeWidth={1}
                            hoverColor="#a855f7"
                            selectColor="#d946ef"
                            hints={true}
                            onSelect={(state) => {
                                // @react-map/india returns state names that might slightly differ (e.g. abbreviations or specific casing)
                                // We'll set it directly and handle slight mismatches on the backend if needed, or exact match.
                                if(state) setSelectedState(state);
                            }}
                        />
                    </div>

                    {/* Data Display Section */}
                    <div className="w-full lg:w-1/2 flex flex-col gap-6">
                        {/* State Dropdown Search */}
                        <div className="w-full bg-black border border-white/20 p-2 rounded-xl flex items-center shadow-2xl">
                            <MapPin className="text-neon-purple ml-4 mr-2" size={24} />
                            <select 
                                className="flex-1 bg-transparent text-white text-lg px-4 py-3 focus:outline-none appearance-none cursor-pointer"
                                value={selectedState}
                                onChange={(e) => setSelectedState(e.target.value)}
                            >
                                <option value="" disabled className="bg-black">{t('select_state_dropdown')}</option>
                                {statesList.map(s => <option key={s} value={s} className="bg-slate-900">{s}</option>)}
                            </select>
                        </div>

                        {stateData ? (
                            <div className="animate-in slide-in-from-right fade-in duration-500">
                                <div className="flex items-center justify-between gap-3 mb-6 border-b border-white/10 pb-4">
                                    <div className="flex items-center gap-3">
                                        <MapPin className="text-neon-purple" size={32} />
                                        <h3 className="text-3xl font-black text-white uppercase tracking-widest">{selectedState} {t('profile')}</h3>
                                    </div>
                                    <div className="flex gap-2 bg-black border border-white/10 p-1 rounded-xl">
                                        <button 
                                            onClick={() => setStateProfileTab('profile')}
                                            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${stateProfileTab === 'profile' ? 'bg-neon-purple text-white' : 'text-slate-400 hover:text-white'}`}
                                        >
                                            Profile
                                        </button>
                                        <button 
                                            onClick={() => setStateProfileTab('trends')}
                                            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${stateProfileTab === 'trends' ? 'bg-neon-cyan text-black' : 'text-slate-400 hover:text-white'}`}
                                        >
                                            Growth Trends
                                        </button>
                                    </div>
                                </div>
                                
                                {stateProfileTab === 'profile' ? (
                                    <>
                                        <div className="grid grid-cols-2 gap-4 mb-6">
                                            <GlowCard accent="purple" className="p-4">
                                                <h4 className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Total Doctors</h4>
                                                <div className="text-2xl font-black text-white font-mono">
                                                    {formatNum((stateData.workforce?.allopathic_doctors || 0) + (stateData.workforce?.dental_surgeons || 0))}
                                                </div>
                                            </GlowCard>
                                            <GlowCard accent="cyan" className="p-4">
                                                <h4 className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">PHCs & CHCs</h4>
                                                <div className="text-2xl font-black text-white font-mono">
                                                    {formatNum((stateData.infrastructure?.phcs || 0) + (stateData.infrastructure?.chcs || 0))}
                                                </div>
                                            </GlowCard>
                                            <GlowCard accent="red" className="p-4 col-span-2 flex justify-between items-center">
                                                <div>
                                                    <h4 className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Licensed Blood Banks</h4>
                                                    <div className="text-2xl font-black text-white font-mono">
                                                        {formatNum((stateData.bloodBanks?.public_banks || 0) + (stateData.bloodBanks?.private_banks || 0))}
                                                    </div>
                                                </div>
                                                <Droplet className="text-red-500/50" size={32} />
                                            </GlowCard>
                                        </div>

                                        <GlowCard className="p-6">
                                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                <Hospital className="text-neon-cyan" size={16}/> {t('district_infrastructure')}
                                            </h4>
                                            <div className="overflow-x-auto max-h-[300px] scrollbar-thin scrollbar-thumb-neon-purple scrollbar-track-transparent pr-2">
                                                <table className="w-full text-left border-collapse">
                                                    <thead className="sticky top-0 bg-slate-900 z-10 shadow-md">
                                                        <tr className="border-b border-white/10 text-[10px] uppercase tracking-widest text-slate-500">
                                                            <th className="p-3">{t('district')}</th>
                                                            <th className="p-3">Sub-Centres</th>
                                                            <th className="p-3">PHCs</th>
                                                            <th className="p-3">CHCs</th>
                                                            <th className="p-3">Dist. Hospitals</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {stateData.districts?.map((inf, idx) => (
                                                            <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                                                <td className="p-3 text-xs font-bold text-white">{inf.district}</td>
                                                                <td className="p-3 text-xs text-slate-300">{inf.sub_centers}</td>
                                                                <td className="p-3 text-xs text-slate-300">{inf.phcs}</td>
                                                                <td className="p-3 text-xs text-slate-300">{inf.chcs}</td>
                                                                <td className="p-3 text-xs text-neon-cyan font-mono">{inf.district_hospitals}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </GlowCard>
                                    </>
                                ) : (
                                    <GlowCard className="p-6">
                                        <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                                            <Activity className="text-neon-cyan" size={18}/> Historical Growth Trends
                                        </h4>
                                        <div className="h-64">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart data={trendData}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                                    <XAxis dataKey="year" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                                                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} domain={[(dataMin) => Math.floor(dataMin * 0.95), 'auto']} tickFormatter={(val) => val >= 1000 ? (val/1000).toFixed(1) + 'k' : val} />
                                                    <Tooltip
                                                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                                        itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                                                        labelStyle={{ color: '#94a3b8', marginBottom: '4px', fontSize: '10px', textTransform: 'uppercase' }}
                                                    />
                                                    <Legend wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px' }} />
                                                    <Line type="monotone" dataKey="phcs_total" name="Total PHCs" stroke="#06b6d4" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                                                    <Line type="monotone" dataKey="chcs_total" name="Total CHCs" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                                                    <Line type="monotone" dataKey="doctors_total" name="Govt Doctors" stroke="#d946ef" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <p className="text-slate-500 text-xs mt-6 text-center italic">
                                            * Trend lines visualize the increase in health infrastructure and workforce since the earliest recorded data.
                                        </p>
                                    </GlowCard>
                                )}
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-white/5 border border-white/10 rounded-2xl border-dashed">
                                <Hexagon className="text-slate-600 mb-4" size={48} />
                                <p className="text-slate-400 uppercase tracking-widest text-sm">
                                    {t('awaiting_selection')}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}

        {/* --- TAB: DISTRICT EXPLORER --- */}
        {activeTab === 'local' && (
            <div className="space-y-8 animate-in fade-in">
                <div className="text-center mb-10">
                    <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-2">
                        {t('explore_healthcare')}
                    </h2>
                </div>

                {/* State Selector */}
                <div className="max-w-xl mx-auto mb-8">
                    <div className="w-full bg-black border border-white/20 p-2 rounded-xl flex items-center shadow-2xl">
                        <MapPin className="text-neon-cyan ml-4 mr-2" size={24} />
                        <select 
                            className="flex-1 bg-transparent text-white text-lg px-4 py-3 focus:outline-none appearance-none cursor-pointer"
                            value={localSelectedState}
                            onChange={(e) => setLocalSelectedState(e.target.value)}
                        >
                            <option value="" disabled className="bg-black">{t('select_state_dropdown')}</option>
                            {statesList.map(s => <option key={s} value={s} className="bg-slate-900">{s}</option>)}
                        </select>
                    </div>
                </div>

                {/* Search Bar & Districts Grid */}
                {localSelectedState ? (
                    <div className="animate-in slide-in-from-bottom fade-in duration-500">
                        {/* Search Bar */}
                        <div className="max-w-2xl mx-auto relative mb-12 group">
                            <div className="absolute inset-0 bg-gradient-to-r from-neon-teal to-neon-cyan rounded-2xl blur opacity-30 group-hover:opacity-60 transition-opacity duration-500"></div>
                            <div className="relative flex items-center bg-black border border-white/20 rounded-2xl p-2 shadow-2xl">
                                <Search className="text-slate-400 ml-4 mr-2" size={24} />
                                <input 
                                    type="text" 
                                    placeholder={t('search_district')}
                                    className="flex-1 bg-transparent text-white text-lg px-4 py-3 focus:outline-none placeholder:text-slate-500 font-sans"
                                    value={localSearchQuery}
                                    onChange={(e) => setLocalSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* District Grid */}
                        <div className="space-y-6">
                            <div className="mb-2">
                                <p className="text-slate-300 font-bold">Browse districts or search for a specific location</p>
                                <p className="text-slate-500 text-sm">Select a district to view available healthcare infrastructure and facility distribution.</p>
                            </div>
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest border-b border-white/10 pb-4">
                                {localSearchQuery.trim() ? t('search_results') : t('featured_districts')}
                            </h3>
                            
                            {localDistrictsData.filter(d => d.district.toLowerCase().includes(localSearchQuery.toLowerCase())).length === 0 ? (
                                <div className="text-center py-10 flex flex-col items-center">
                                    <ShieldAlert className="text-slate-600 mb-4" size={48} />
                                    <p className="text-slate-400 font-mono uppercase tracking-widest">{t('no_districts_found')}</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {localDistrictsData
                                        .filter(d => d.district.toLowerCase().includes(localSearchQuery.toLowerCase()))
                                        .map((district, idx) => (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            key={district.district} 
                                            onClick={() => setSelectedDistrictProfile(district)} 
                                            className="cursor-pointer"
                                        >
                                            <GlowCard accent="cyan" className="p-6 group hover:border-neon-cyan/50 transition-all h-full flex flex-col justify-between">
                                                <div className="flex items-center gap-4 mb-6">
                                                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-neon-cyan/10 group-hover:border-neon-cyan/30 transition-all">
                                                        <MapPin className="text-slate-300 group-hover:text-neon-cyan transition-all" size={24} />
                                                    </div>
                                                    <h4 className="text-xl font-black text-white line-clamp-1">{district.district}</h4>
                                                </div>
                                                
                                                <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4 mt-auto">
                                                    <div>
                                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t('primary_health_centres')}</p>
                                                        <p className="text-lg font-black text-white">{formatNum(district.phcs)}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t('community_health_centres')}</p>
                                                        <p className="text-lg font-black text-white">{formatNum(district.chcs)}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Sub-Centres</p>
                                                        <p className="text-lg font-black text-slate-300">{formatNum(district.sub_centers)}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Dist. Hospitals</p>
                                                        <p className="text-lg font-black text-neon-cyan">{formatNum(district.district_hospitals)}</p>
                                                    </div>
                                                </div>
                                            </GlowCard>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="animate-in fade-in space-y-12">
                        <div className="text-center max-w-2xl mx-auto">
                            <h2 className="text-2xl md:text-3xl font-black text-white mb-4">Explore District Healthcare Infrastructure</h2>
                            <p className="text-slate-400">
                                Select a state on the map or from the dropdown above to explore district-wise healthcare infrastructure, including Primary Health Centres, Community Health Centres, Sub-Centres, and District Hospitals.
                            </p>
                        </div>
                        
                        {sampleDistricts.length > 0 && (
                            <div>
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest border-b border-white/10 pb-4 mb-6">
                                    Explore Sample Districts
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-80 pointer-events-none">
                                    {sampleDistricts.slice(0, 6).map((district, idx) => (
                                        <GlowCard key={district.district} accent="default" className="p-6 h-full flex flex-col justify-between filter grayscale-[50%]">
                                            <div className="flex items-center gap-4 mb-6">
                                                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                                                    <MapPin className="text-slate-500" size={24} />
                                                </div>
                                                <h4 className="text-xl font-black text-white line-clamp-1">{district.district}</h4>
                                            </div>
                                            
                                            <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4 mt-auto">
                                                <div>
                                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t('primary_health_centres')}</p>
                                                    <p className="text-lg font-black text-slate-300">{formatNum(district.phcs)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t('community_health_centres')}</p>
                                                    <p className="text-lg font-black text-slate-300">{formatNum(district.chcs)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Sub-Centres</p>
                                                    <p className="text-lg font-black text-slate-400">{formatNum(district.sub_centers)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Dist. Hospitals</p>
                                                    <p className="text-lg font-black text-slate-400">{formatNum(district.district_hospitals)}</p>
                                                </div>
                                            </div>
                                        </GlowCard>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        )}

      </main>

      {/* District Detail Profile Modal */}
      {selectedDistrictProfile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
              <div className="bg-slate-900 border border-white/10 p-6 md:p-8 rounded-2xl w-full max-w-3xl shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">
                  <button onClick={() => setSelectedDistrictProfile(null)} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors bg-white/5 p-2 rounded-full">
                      <X size={20} />
                  </button>
                  
                  <div className="flex items-center gap-3 mb-2">
                      <MapPin className="text-neon-cyan" size={32} />
                      <h3 className="text-3xl md:text-4xl font-black text-white">{selectedDistrictProfile.district} District Healthcare Infrastructure</h3>
                  </div>
                  <p className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-8 border-b border-white/10 pb-4">
                      {localSelectedState} • {t('district_profile')}
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                      <GlowCard accent="cyan" className="p-4 text-center">
                          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t('primary_health_centres')}</h4>
                          <div className="text-2xl font-black text-white">{formatNum(selectedDistrictProfile.phcs)}</div>
                      </GlowCard>
                      <GlowCard accent="purple" className="p-4 text-center">
                          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t('community_health_centres')}</h4>
                          <div className="text-2xl font-black text-white">{formatNum(selectedDistrictProfile.chcs)}</div>
                      </GlowCard>
                      <GlowCard accent="default" className="p-4 text-center">
                          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Sub-Centres</h4>
                          <div className="text-2xl font-black text-white">{formatNum(selectedDistrictProfile.sub_centers)}</div>
                      </GlowCard>
                      <GlowCard accent="teal" className="p-4 text-center">
                          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Dist. Hospitals</h4>
                          <div className="text-2xl font-black text-neon-cyan">{formatNum(selectedDistrictProfile.district_hospitals)}</div>
                      </GlowCard>
                  </div>

                  <GlowCard className="p-6">
                      <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                          <BarChart2 className="text-neon-cyan"/> {t('infrastructure_distribution')}
                      </h4>
                      <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={[
                                  { name: 'Sub Centres', count: Number(selectedDistrictProfile.sub_centers) || 0 },
                                  { name: 'PHCs', count: Number(selectedDistrictProfile.phcs) || 0 },
                                  { name: 'CHCs', count: Number(selectedDistrictProfile.chcs) || 0 },
                                  { name: 'Dist. Hospitals', count: Number(selectedDistrictProfile.district_hospitals) || 0 }
                              ]}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                  <XAxis dataKey="name" stroke="#888" tick={{fill: '#888', fontSize: 11}} axisLine={false} tickLine={false} />
                                  <YAxis stroke="#888" tick={{fill: '#888', fontSize: 11}} axisLine={false} tickLine={false} />
                                  <Tooltip contentStyle={{backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px'}} itemStyle={{color: '#fff', fontWeight: 'bold'}} cursor={{fill: 'rgba(255,255,255,0.02)'}}/>
                                  <Bar dataKey="count" fill="#00f0ff" radius={[4, 4, 0, 0]} animationDuration={1000} />
                              </BarChart>
                          </ResponsiveContainer>
                      </div>
                  </GlowCard>

                  <div className="mt-8 text-center">
                      <button 
                          onClick={() => setSelectedDistrictProfile(null)}
                          className="px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-bold transition-all text-sm uppercase tracking-widest"
                      >
                          {t('back_to_districts')}
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-black/80 py-8 text-center backdrop-blur-md">
        <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-neon-cyan/80">
          ArogyaNet AI: National Citizen Health Intelligence Portal
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
