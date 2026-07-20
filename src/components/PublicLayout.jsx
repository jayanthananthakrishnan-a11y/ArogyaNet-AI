import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Activity, ShieldCheck, Globe, Menu, X, ArrowRight, ShieldAlert, Bot, User, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../LanguageContext';
import { useCitizenAuth } from '../CitizenAuthContext';
import ChatbotModal from './ChatbotModal';
import SOSModal from './SOSModal';

const PublicLayout = ({ children }) => {
  const { language, toggleLanguage, t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showSOS, setShowSOS] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const { citizenUser, logoutCitizen } = useCitizenAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const checkIsActive = (path) => {
    const currentPath = location.pathname;
    const currentSearch = location.search;

    if (path === '/') {
      return currentPath === '/' && !currentSearch;
    }

    if (path.includes('?')) {
      return (currentPath + currentSearch) === path;
    }

    return currentPath === path && !currentSearch;
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    const handleOpenChatbot = () => {
      if (!citizenUser) {
        navigate('/signin');
      } else {
        setShowChatbot(true);
      }
    };
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('open-chatbot', handleOpenChatbot);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('open-chatbot', handleOpenChatbot);
    };
  }, [citizenUser, navigate]);

  const navLinks = [
    { name: t('home'), path: '/' },
    { name: t('national_data') || 'National Overview', path: '/analytics' },
    { name: t('state_insights') || 'State Insights', path: '/analytics?tab=state' },
    { name: t('district_explorer') || 'District Explorer', path: '/analytics?tab=local' },
    { name: 'Contact', path: '/contact' },
    { name: 'Project Roadmap', path: '/roadmap' }
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans selection:bg-neon-cyan/30 flex flex-col relative overflow-hidden">
      
      {/* Top Navbar */}
      <nav 
        className={`fixed w-full z-50 transition-all duration-300 border-b ${
          scrolled 
            ? 'bg-slate-900/90 backdrop-blur-md border-white/10 shadow-lg py-3' 
            : 'bg-transparent border-transparent py-5'
        }`}
      >
        <div className="w-full px-4 lg:px-8 flex justify-between items-center">
          
          {/* Left Side: Hamburger & Logo */}
          <div className="flex items-center gap-4 sm:gap-6">
            <button 
              className="p-2 text-slate-300 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>

            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-neon-cyan to-blue-600 flex items-center justify-center shadow-lg shadow-neon-cyan/20 overflow-hidden">
                <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full transition-transform duration-700 ease-in-out -skew-x-12"></div>
                <Activity className="text-white" size={20} />
              </div>
              <div className="flex flex-col hidden sm:flex">
                <span className="font-bold text-xl tracking-tight text-white leading-none">ArogyaNet <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-blue-400">AI</span></span>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mt-1">National Health Intelligence</span>
              </div>
            </Link>
          </div>

          {/* Right Side: Actions & Logins */}
          <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-4">
            
            {/* AI Chatbot Button */}
            <button 
              onClick={() => {
                if (!citizenUser) navigate('/signin');
                else setShowChatbot(true);
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neon-cyan/10 hover:bg-neon-cyan/20 border border-neon-cyan/30 text-neon-cyan hover:text-cyan-300 transition-colors text-sm font-bold shadow-[0_0_15px_rgba(6,182,212,0.2)]"
            >
              <Bot size={16} />
              <span className="hidden lg:inline">Assistant</span>
            </button>

            {/* Translate Button */}
            <button 
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-sm font-bold text-slate-300 hover:text-white"
            >
              <Globe size={16} />
              <span className="hidden lg:inline">{language === 'en' ? 'हिन्दी' : 'English'}</span>
            </button>

            {/* SOS Button */}
            <button 
              onClick={() => setShowSOS(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 hover:text-red-300 transition-colors text-sm font-bold shadow-[0_0_15px_rgba(239,68,68,0.2)]"
            >
              <ShieldAlert size={16} />
              <span className="hidden lg:inline">SOS</span>
            </button>

            <div className="hidden md:flex items-center gap-4 border-l border-white/10 pl-4 ml-2">
              {!citizenUser ? (
                <>

                  <Link 
                    to="/signin"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-sm font-bold text-white"
                  >
                    Citizen Login
                  </Link>
                </>
              ) : (
                <div className="flex items-center gap-4">
                  <Link to="/profile" className="text-sm font-bold text-neon-cyan flex items-center gap-2 hover:text-cyan-300 transition-colors">
                    <User size={16} /> {citizenUser.name}
                  </Link>
                  <button 
                    onClick={logoutCitizen}
                    className="text-slate-400 hover:text-white transition-colors"
                    title="Logout"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              )}

              <button 
                onClick={() => navigate('/login')}
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-bold tracking-wider shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5"
              >
                <ShieldCheck size={16} />
                Command Login
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar Navigation */}
      <AnimatePresence>
        {sidebarOpen && (
          <div className="fixed inset-0 z-[60] flex">
            {/* Overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            ></motion.div>
            
            {/* Drawer */}
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-80 max-w-[80vw] h-full bg-slate-900 border-r border-white/10 shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-white/10 flex justify-between items-center">
                <Link to="/" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3">
                  <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-neon-cyan to-blue-600 flex items-center justify-center shadow-lg shadow-neon-cyan/20">
                    <Activity className="text-white" size={16} />
                  </div>
                  <span className="font-bold text-lg text-white leading-none">ArogyaNet <span className="text-neon-cyan">AI</span></span>
                </Link>
              <button 
                className="text-slate-400 hover:text-white"
                onClick={() => setSidebarOpen(false)}
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-2">
              {navLinks.map((link) => {
                const isActive = checkIsActive(link.path);
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`px-4 py-3 rounded-xl text-sm font-bold tracking-wider uppercase transition-colors ${
                      isActive ? 'bg-neon-cyan/10 text-neon-cyan shadow-[inset_4px_0_0_0_rgba(6,182,212,1)] bg-gradient-to-r from-neon-cyan/20 to-transparent' : 'text-slate-300 hover:bg-white/5 hover:text-white border-transparent'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
              
              {/* Mobile Only: Show logins here since top bar is crowded */}
              <div className="mt-8 pt-8 border-t border-white/10 flex flex-col gap-4 md:hidden">
                {!citizenUser ? (
                  <>

                    <Link 
                      to="/signin"
                      onClick={() => setSidebarOpen(false)}
                      className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold"
                    >
                      Citizen Login
                    </Link>
                  </>
                ) : (
                  <>
                    <Link 
                      to="/profile"
                      onClick={() => setSidebarOpen(false)}
                      className="flex items-center justify-center gap-2 py-3 rounded-xl bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan font-bold"
                    >
                      <User size={18} /> My Profile
                    </Link>
                    <button 
                      onClick={() => { logoutCitizen(); setSidebarOpen(false); }}
                      className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold"
                    >
                      <LogOut size={18} /> Logout
                    </button>
                  </>
                )}
                <button 
                  onClick={() => { navigate('/login'); setSidebarOpen(false); }}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 text-white font-bold shadow-lg shadow-blue-500/20"
                >
                  <ShieldCheck size={18} />
                  Command Login
                </button>
              </div>
            </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col w-full relative z-10 pt-24">
        {children}
      </main>

      {/* Unified Footer */}
      <footer className="bg-slate-950 border-t border-white/10 pt-16 pb-8 relative z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
              <Link to="/" className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-cyan to-blue-600 flex items-center justify-center">
                  <Activity className="text-white" size={16} />
                </div>
                <span className="font-bold text-lg text-white">ArogyaNet AI</span>
              </Link>
              <p className="text-slate-400 text-sm leading-relaxed max-w-md">
                India's premier AI-powered healthcare intelligence platform, providing real-time data, predictive analytics, and unified resource tracking across all primary and community health centers.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-bold tracking-widest uppercase text-sm mb-6">Platform</h4>
              <ul className="flex flex-col gap-4 text-slate-400 text-sm">
                <li><Link to="/" className="hover:text-neon-cyan transition-colors">Home</Link></li>
                <li><Link to="/analytics" className="hover:text-neon-cyan transition-colors">National Data</Link></li>
                <li><Link to="/roadmap" className="hover:text-neon-cyan transition-colors">Project Roadmap</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-bold tracking-widest uppercase text-sm mb-6">Legal & Govt</h4>
              <ul className="flex flex-col gap-4 text-slate-400 text-sm">
                <li className="hover:text-neon-cyan transition-colors cursor-pointer">Open Government Data</li>
                <li className="hover:text-neon-cyan transition-colors cursor-pointer">Privacy Policy</li>
                <li className="hover:text-neon-cyan transition-colors cursor-pointer">Terms of Service</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 text-xs">
              © {new Date().getFullYear()} ArogyaNet AI Initiative. {t('built_for_india')}
            </p>
            <div className="flex items-center gap-2 text-slate-500 text-xs font-mono bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
              <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
              {t('system_status')}
            </div>
          </div>
        </div>
      </footer>
      
      <SOSModal isOpen={showSOS} onClose={() => setShowSOS(false)} />
      <ChatbotModal isOpen={showChatbot} onClose={() => setShowChatbot(false)} />
    </div>
  );
};

export default PublicLayout;
