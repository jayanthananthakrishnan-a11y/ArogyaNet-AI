import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Package, ShieldAlert, Users, LayoutDashboard, Activity, LogOut, Hexagon, MessageSquare, Plus, ClipboardList, AlertTriangle, ShieldCheck, Cpu, UserCircle, Globe, Truck, Map } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { useLanguage } from '../LanguageContext';
import SOSModal from './SOSModal';
import ChatbotModal from './ChatbotModal';

const SidebarItem = ({ icon: Icon, text, to }) => (
  <NavLink 
    to={to} 
    className={({ isActive }) => `
      flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 border border-transparent
      ${isActive 
        ? 'bg-neon-cyan/10 text-neon-cyan border-l-4 border-l-neon-cyan shadow-[inset_4px_0_0_0_rgba(6,182,212,1)] bg-gradient-to-r from-neon-cyan/20 to-transparent' 
        : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}
    `}
  >
    {({ isActive }) => (
      <React.Fragment>
        <Icon size={20} className={isActive ? 'drop-shadow-glow-cyan' : ''} />
        <span className="font-semibold text-sm uppercase tracking-widest">{text}</span>
      </React.Fragment>
    )}
  </NavLink>
);

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const [showSOS, setShowSOS] = useState(false);
  const [showChat, setShowChat] = useState(false);

  // Protect internal routes
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdmin = user.role === 'admin';

  return (
    <div className="flex h-screen bg-black text-slate-200 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 bg-slate-950/80 backdrop-blur-2xl border-r border-white/10 flex flex-col z-20 shadow-2xl relative">
        <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-neon-cyan/50 via-neon-purple/20 to-transparent"></div>
        <div className="p-6 flex items-center gap-3 border-b border-white/10 bg-black/20">
          <Hexagon className="text-neon-cyan drop-shadow-glow-cyan" size={32} />
          <div>
              <h1 className="text-xl font-black text-white tracking-widest uppercase">
                Arogya<span className="text-neon-cyan">Net</span> AI
              </h1>
              <p className="text-[10px] text-neon-teal uppercase tracking-widest font-mono">
                {user.role === 'admin' ? 'District Command' : user.role === 'mla' ? 'District Representative' : `Facility: ${user.center_id}`}
              </p>
          </div>
        </div>
        
        <div className="px-6 py-4 border-b border-white/5">
            <label className="text-[10px] uppercase text-slate-500 font-bold tracking-widest mb-2 block">{t('location_filter')}</label>
            <select className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-neon-cyan font-semibold outline-none focus:border-neon-cyan/50 transition-colors cursor-pointer appearance-none">
                <option>{(user.role === 'admin' || user.role === 'mla') ? t('all_districts') : user.center_id}</option>
            </select>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
          {/* Active Modules */}
          <SidebarItem icon={LayoutDashboard} text={t('dashboard')} to="/dashboard" />
          
          {/* MLA & Admin Shared (Observer Mode) */}
          {(user.role === 'admin' || user.role === 'mla') && (
              <>
                 <SidebarItem icon={Package} text={t('logistics')} to="/inventory" />
                 <SidebarItem icon={Truck} text={t('ambulance_dispatch')} to="/ambulance" />
                 <SidebarItem icon={Activity} text={t('surveillance')} to="/surveillance" />
                 <SidebarItem icon={MessageSquare} text="Direct Channel" to="/messages" />
              </>
          )}

          {/* Admin Exclusive */}
          {user.role === 'admin' && (
              <>
                 <SidebarItem icon={ShieldAlert} text={t('command_center')} to="/command-center" />
                 <SidebarItem icon={Users} text={t('attendance')} to="/attendance" />
                 <SidebarItem icon={Plus} text={t('registry')} to="/registry" />
              </>
          )}

          {/* Staff Exclusive */}
          {user.role === 'staff' && (
              <>
                 <SidebarItem icon={Package} text={t('daily_ops')} to="/inventory" />
                 <SidebarItem icon={Activity} text={t('surveillance')} to="/surveillance" />
                 <SidebarItem icon={Users} text={t('attendance')} to="/attendance" />
                 <SidebarItem icon={ClipboardList} text={t('patient_logging')} to="/patient-logging" />
                 <SidebarItem icon={Activity} text="Referrals" to="/referrals" />
              </>
          )}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-2 bg-black/40">
          <button onClick={() => navigate('/roadmap')} className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-neon-purple hover:bg-neon-purple/10 transition-colors">
            <Map size={20} />
            <span className="font-semibold text-sm uppercase tracking-widest">{t('project_roadmap')}</span>
          </button>
          <button onClick={() => navigate('/')} className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-neon-teal hover:bg-neon-teal/10 transition-colors">
            <Hexagon size={20} />
            <span className="font-semibold text-sm uppercase tracking-widest">{t('public_portal')}</span>
          </button>
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-rose-400 hover:bg-rose-400/10 transition-colors">
            <LogOut size={20} />
            <span className="font-semibold text-sm uppercase tracking-widest">{t('sign_out')}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEgMWgydjJIMUMxeiIgZmlsbD0icmdiYSgyNTUsIDI1NSwgMjU1LCAwLjAyKSIgZmlsbC1ydWxlPSJldmVub2RkIi8+PC9zdmc+')]">
        {/* Topbar */}
        <header className="h-16 bg-slate-950/80 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-8 z-10 shadow-lg">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2 bg-neon-teal/10 px-3 py-1 rounded-full border border-neon-teal/30 text-neon-teal text-xs font-bold uppercase tracking-widest shadow-glow-teal">
              <span className="w-2 h-2 rounded-full bg-neon-teal shadow-glow-teal animate-pulse"></span>
              {t('live_system')}
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <button onClick={toggleLanguage} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-300 bg-white/5 px-4 py-2 rounded-lg border border-white/10 hover:bg-white/10 hover:text-white transition-colors">
               <Globe size={16} className={language === 'hi' ? "text-neon-cyan" : "text-slate-400"} />
               {language === 'en' ? 'EN' : 'HI'}
            </button>
            {user.role === 'staff' && (
              <button onClick={() => setShowSOS(true)} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white bg-rose-500/20 px-4 py-2 rounded-lg border border-rose-500/50 hover:bg-rose-500/30 transition-colors shadow-[0_0_15px_rgba(244,63,94,0.3)]">
                 <ShieldAlert size={16} className="text-rose-400" />
                 {t('sos')}
              </button>
            )}
            <button onClick={() => setShowChat(true)} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white bg-neon-cyan/20 px-4 py-2 rounded-lg border border-neon-cyan/50 hover:bg-neon-cyan/30 transition-colors shadow-glow-cyan">
               <Cpu size={16} className="text-neon-cyan" />
               {t('ai_assistant')}
            </button>
            <div className="w-px h-8 bg-white/10 mx-2"></div>
            <button className="flex items-center gap-3 text-sm text-slate-300 hover:text-white transition-colors bg-black/40 px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20 cursor-default">
               <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                  <UserCircle size={20} />
               </div>
               <div className="flex flex-col items-start leading-tight pr-2">
                   <span className="font-bold text-white">{user.name}</span>
                   <span className="text-[10px] text-slate-400 uppercase">{user.role}</span>
               </div>
            </button>
          </div>
        </header>

        {/* Scrollable Page Area */}
        <div className="flex-1 overflow-auto p-6 md:p-8 relative z-0 custom-scrollbar">
          {children}
        </div>
      </main>

      {/* Modals */}
      <SOSModal isOpen={showSOS} onClose={() => setShowSOS(false)} />
      <ChatbotModal isOpen={showChat} onClose={() => setShowChat(false)} />
    </div>
  );
};

export default Layout;
