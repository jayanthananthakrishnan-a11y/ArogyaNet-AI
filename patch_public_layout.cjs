const fs = require('fs');

let content = fs.readFileSync('src/components/PublicLayout.jsx', 'utf8');

// 1. Add required imports: useCitizenAuth, ChatbotModal, Bot, User, LogOut
if (!content.includes('useCitizenAuth')) {
    content = content.replace(
        "import { useLanguage } from '../LanguageContext';",
        "import { useLanguage } from '../LanguageContext';\nimport { useCitizenAuth } from '../CitizenAuthContext';\nimport ChatbotModal from './ChatbotModal';"
    );
    content = content.replace(
        "import { Activity, ShieldCheck, Globe, Menu, X, ArrowRight, ShieldAlert } from 'lucide-react';",
        "import { Activity, ShieldCheck, Globe, Menu, X, ArrowRight, ShieldAlert, Bot, User, LogOut } from 'lucide-react';"
    );
}

// 2. Add citizenUser and logoutCitizen to component
if (!content.includes('citizenUser')) {
    content = content.replace(
        "const [showSOS, setShowSOS] = useState(false);",
        "const [showSOS, setShowSOS] = useState(false);\n  const [showChatbot, setShowChatbot] = useState(false);\n  const { citizenUser, logoutCitizen } = useCitizenAuth();"
    );
}

// 3. Update navLinks
const newNavLinks = `
  const navLinks = [
    { name: t('home'), path: '/' },
    { name: t('national_data'), path: '/analytics' },
    { name: 'Contact', path: '/contact' }
  ];
`;
content = content.replace(/const navLinks = \[[\s\S]*?\];/, newNavLinks.trim());

// 4. Update the desktop buttons area
const desktopButtonsOld = `
            <div className="flex items-center gap-4 border-l border-white/10 pl-6">
              <button 
                onClick={toggleLanguage}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-sm font-bold text-slate-300 hover:text-white"
              >
                <Globe size={14} />
                {language === 'en' ? 'हिन्दी' : 'English'}
              </button>
              
              <button 
                onClick={() => setShowSOS(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 hover:text-red-300 transition-colors text-sm font-bold shadow-[0_0_15px_rgba(239,68,68,0.2)]"
              >
                <ShieldAlert size={14} />
                SOS
              </button>

              <button 
                onClick={() => navigate('/login')}
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-bold tracking-wider shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5"
              >
                <ShieldCheck size={16} />
                Command Login
              </button>
            </div>
`;

const desktopButtonsNew = `
            <div className="flex items-center gap-4 border-l border-white/10 pl-6">
              <button 
                onClick={toggleLanguage}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-sm font-bold text-slate-300 hover:text-white"
              >
                <Globe size={14} />
                {language === 'en' ? 'हिन्दी' : 'English'}
              </button>

              {!citizenUser ? (
                <>
                  <Link 
                    to="/signup"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neon-cyan hover:bg-cyan-400 text-slate-900 text-sm font-bold tracking-wider transition-all"
                  >
                    Get Started
                  </Link>
                  <Link 
                    to="/signin"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-sm font-bold text-white"
                  >
                    Citizen Login
                  </Link>
                </>
              ) : (
                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold text-neon-cyan flex items-center gap-2">
                    <User size={14} /> {citizenUser.name}
                  </span>
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
`;

content = content.replace(desktopButtonsOld, desktopButtonsNew);

// 5. Update the mobile buttons area
const mobileButtonsOld = `
          <div className="flex flex-col gap-4 mt-4">
             <button 
                onClick={() => { toggleLanguage(); setMobileMenuOpen(false); }}
                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold"
              >
                <Globe size={18} />
                {language === 'en' ? 'Switch to Hindi' : 'Switch to English'}
              </button>
              <button 
                onClick={() => { setShowSOS(true); setMobileMenuOpen(false); }}
                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 font-bold"
              >
                <ShieldAlert size={18} />
                Emergency SOS
              </button>
              <button 
                onClick={() => navigate('/login')}
                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 text-white font-bold shadow-lg shadow-blue-500/20"
              >
                <ShieldCheck size={18} />
                Command Login
              </button>
          </div>
`;

const mobileButtonsNew = `
          <div className="flex flex-col gap-4 mt-4">
             <button 
                onClick={() => { toggleLanguage(); setMobileMenuOpen(false); }}
                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold"
              >
                <Globe size={18} />
                {language === 'en' ? 'Switch to Hindi' : 'Switch to English'}
              </button>
              
              {!citizenUser ? (
                <>
                  <Link 
                    to="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 py-3 rounded-xl bg-neon-cyan text-slate-900 font-bold"
                  >
                    Get Started
                  </Link>
                  <Link 
                    to="/signin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold"
                  >
                    Citizen Login
                  </Link>
                </>
              ) : (
                <button 
                  onClick={() => { logoutCitizen(); setMobileMenuOpen(false); }}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold"
                >
                  <LogOut size={18} />
                  Logout ({citizenUser.name})
                </button>
              )}

              <button 
                onClick={() => { setShowSOS(true); setMobileMenuOpen(false); }}
                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 font-bold"
              >
                <ShieldAlert size={18} />
                Emergency SOS
              </button>
              <button 
                onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}
                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 text-white font-bold shadow-lg shadow-blue-500/20"
              >
                <ShieldCheck size={18} />
                Command Login
              </button>
          </div>
`;

content = content.replace(mobileButtonsOld, mobileButtonsNew);

// 6. Add floating AI Chatbot button and modal to the layout, and update footer
// Find the closing </div> of the layout
const layoutEndRegex = /<footer[\s\S]*?<\/footer>\s*<\/div>\s*\);\s*};\s*export default PublicLayout;/;

const newFooterAndModals = `
      {/* Footer */}
      <footer className="border-t border-white/10 bg-black py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-cyan to-blue-600 flex items-center justify-center">
                <Activity className="text-white" size={16} />
              </div>
              <span className="font-bold text-lg text-white">ArogyaNet <span className="text-neon-cyan">AI</span></span>
            </Link>
            <p className="text-slate-400 text-sm max-w-sm">
              The central nervous system for India's healthcare infrastructure. Bringing data, transparency, and AI to every citizen.
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Platform</h4>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li><Link to="/" className="hover:text-neon-cyan transition-colors">Home</Link></li>
              <li><Link to="/analytics" className="hover:text-neon-cyan transition-colors">National Data</Link></li>
              <li><button onClick={() => setShowChatbot(true)} className="hover:text-neon-cyan transition-colors">AI Assistant</button></li>
              <li><Link to="/contact" className="hover:text-neon-cyan transition-colors">Contact Us</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Connect</h4>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li>Jayanth Ananthakrishnan (Founder)</li>
              <li><a href="https://www.linkedin.com/in/jayanth-ananthakrishnan-609269306" target="_blank" rel="noopener noreferrer" className="hover:text-neon-cyan transition-colors">LinkedIn Profile</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 md:px-8 mt-12 pt-8 border-t border-white/10 text-center text-slate-500 text-sm">
          &copy; {new Date().getFullYear()} ArogyaNet AI. All rights reserved.
        </div>
      </footer>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-4 z-40">
        <button 
          onClick={() => setShowSOS(true)}
          className="w-14 h-14 rounded-full bg-red-500/20 hover:bg-red-500/40 border border-red-500/50 flex items-center justify-center text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)] transition-all hover:scale-110"
          title="Emergency SOS"
        >
          <ShieldAlert size={24} />
        </button>

        <button 
          onClick={() => {
            if (!citizenUser) {
              navigate('/signin');
            } else {
              setShowChatbot(true);
            }
          }}
          className="w-14 h-14 rounded-full bg-neon-cyan hover:bg-cyan-400 flex items-center justify-center text-slate-900 shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all hover:scale-110"
          title="AI Assistant"
        >
          <Bot size={28} />
        </button>
      </div>

      <SOSModal isOpen={showSOS} onClose={() => setShowSOS(false)} />
      <ChatbotModal isOpen={showChatbot} onClose={() => setShowChatbot(false)} />
    </div>
  );
};

export default PublicLayout;
`;

content = content.replace(layoutEndRegex, newFooterAndModals);

fs.writeFileSync('src/components/PublicLayout.jsx', content);
console.log('PublicLayout.jsx updated');
