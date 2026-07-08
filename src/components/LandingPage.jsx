import React, { useState, useEffect } from 'react';
import { Search, ShieldAlert, Activity, Hospital, ChevronRight, X, Hexagon } from 'lucide-react';
import { Link } from 'react-router-dom';
import GlowCard from './ui/GlowCard';
import { useLanguage } from '../LanguageContext';

const LandingPage = () => {
  const { t, language, toggleLanguage } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFacility, setSelectedFacility] = useState(null);

  const quotes = [
    "Saluting our Healthcare Warriors",
    "Healing Together, Building the Future",
    "Predict. Prevent. Redistribute. Respond."
  ];
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

  useEffect(() => {
    // Fetch all facilities on mount
    const fetchFacilities = async () => {
      try {
        const res = await fetch(`/api/district/facilities?lang=${language}`);
        const data = await res.json();
        setFacilities(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFacilities();

    // Rotate quotes
    const quoteInterval = setInterval(() => {
      setCurrentQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 4000);

    return () => clearInterval(quoteInterval);
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/public/search?query=${encodeURIComponent(searchQuery)}&lang=${language}`);
      const data = await res.json();
      setFacilities(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black font-sans relative overflow-hidden">
      {/* Background Cyber Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-neon-cyan/20 blur-[150px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-neon-purple/20 blur-[150px] rounded-full pointer-events-none"></div>

      {/* Header */}
      <header className="relative z-10 flex justify-between items-center p-6 md:px-12 border-b border-white/10 bg-black/50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Hexagon className="text-neon-cyan drop-shadow-glow-cyan" size={32} />
          <h1 className="text-xl font-black text-white uppercase tracking-widest">
            ArogyaNet <span className="text-neon-cyan">AI</span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={toggleLanguage} className="text-xs font-bold uppercase tracking-widest text-slate-300 bg-white/5 px-4 py-2 rounded-full border border-white/10 hover:bg-white/10 transition-colors">
            {language === 'en' ? 'हिन्दी' : 'English'}
          </button>
          <Link to="/login" className="px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/20 text-white font-bold uppercase tracking-widest text-xs rounded-full transition-all">
            Command Login
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-5xl mx-auto px-6 pt-20 pb-24">
        
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tight mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-purple">{t('citizen_health_portal')}</span>
          </h2>
          <p className="text-slate-400 font-mono uppercase tracking-widest text-sm md:text-base h-6 transition-all duration-500 animate-in fade-in">
            {t(quotes[currentQuoteIndex])}
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto relative mb-16 group">
          <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan to-neon-purple rounded-2xl blur opacity-30 group-hover:opacity-60 transition-opacity duration-500"></div>
          <div className="relative flex items-center bg-black border border-white/20 rounded-2xl p-2 shadow-2xl">
            <Search className="text-slate-400 ml-4 mr-2" size={24} />
            <input 
              type="text" 
              placeholder={t('search_placeholder')}
              className="flex-1 bg-transparent text-white text-lg px-4 py-3 focus:outline-none placeholder:text-slate-500 font-sans"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button 
              type="submit" 
              className="bg-neon-cyan hover:bg-neon-cyan/80 text-black font-black uppercase tracking-widest px-8 py-3 rounded-xl transition-all shadow-glow-cyan"
            >
              {t('search')}
            </button>
          </div>
        </form>

        {/* Search Results / Facility Grid */}
        <div className="space-y-6 animate-fade-in-up">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest border-b border-white/10 pb-4">
            {searchQuery.trim() ? `${ t('facilities_found') } "${searchQuery}"` : t('district_facilities')}
          </h3>
          
          {loading ? (
              <div className="text-center py-10 text-neon-cyan font-mono animate-pulse uppercase tracking-widest">{t('scanning_network')}</div>
            ) : facilities.length === 0 ? (
              <div className="text-center py-10">
                <ShieldAlert className="mx-auto text-slate-600 mb-4" size={48} />
                <p className="text-slate-400 font-mono uppercase tracking-widest">{t('no_facilities_found')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {facilities.map(facility => (
                  <div key={facility.id} onClick={() => setSelectedFacility(facility)} className="cursor-pointer">
                    <GlowCard accent="default" className="p-6 group hover:border-neon-cyan/50 transition-all">
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-neon-cyan/10 group-hover:border-neon-cyan/30 transition-all">
                            <Hospital className="text-slate-300 group-hover:text-neon-cyan group-hover:drop-shadow-glow-cyan transition-all" size={24} />
                          </div>
                          <div>
                            <h4 className="text-lg font-black text-white">{facility.name}</h4>
                            <p className="text-[10px] uppercase font-mono text-slate-500">{facility.location}</p>
                          </div>
                        </div>
                        <div className="px-3 py-1 bg-neon-teal/20 border border-neon-teal/30 rounded text-[10px] font-bold text-neon-teal uppercase tracking-wider">
                          {t('status')}: {t('normal')}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-6">
                        <div>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{t('total_bed_capacity')}</p>
                          <p className="text-xl font-black text-white">{facility.total_beds}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{t('recent_alerts')}</p>
                          <p className="text-sm font-semibold text-slate-300">
                            {facility.critical_alerts > 0 ? `${ facility.critical_alerts } ${ t('warnings') } ` : t('none_active')}
                          </p>
                        </div>
                      </div>
                    </GlowCard>
                  </div>
                ))}
              </div>
            )}
        </div>
      </main>

      {/* Public Modal (Hides Sensitive Data) */}
      {selectedFacility && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
              <div className="bg-slate-900 border border-white/10 p-6 rounded-2xl w-full max-w-lg shadow-2xl relative">
                  <button onClick={() => setSelectedFacility(null)} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors">
                      <X size={20} />
                  </button>
                  <div className="flex items-center gap-3 mb-6">
                      <Hospital className="text-neon-cyan" size={32} />
                      <div>
                          <h3 className="text-2xl font-black text-white">{selectedFacility.name}</h3>
                          <p className="text-xs font-mono uppercase text-slate-400 tracking-widest">{selectedFacility.type} • {selectedFacility.location}</p>
                      </div>
                  </div>

                  <div className="space-y-4">
                      <div className="bg-black/50 border border-white/5 p-4 rounded-xl flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('operating_status')}</span>
                          <span className="px-3 py-1 bg-neon-teal/20 border border-neon-teal/30 rounded text-[10px] font-bold text-neon-teal uppercase tracking-wider">{t('fully_operational')}</span>
                      </div>
                      <div className="bg-black/50 border border-white/5 p-4 rounded-xl flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('public_bed_capacity')}</span>
                          <span className="text-xl font-black text-white">{selectedFacility.total_beds} {t('beds')}</span>
                      </div>
                      <div className="bg-black/50 border border-white/5 p-4 rounded-xl flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('ambulance_fleet_status')}</span>
                          <span className="text-sm font-semibold text-slate-300">{t('active')}</span>
                      </div>
                      <div className="mt-6 pt-4 border-t border-white/5 text-center">
                          <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">{t('restricted_message')}</p>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-black/80 py-8 text-center backdrop-blur-md">
        <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-neon-cyan/80">
          ArogyaNet AI: Predict. Prevent. Redistribute. Respond.
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
