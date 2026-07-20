import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../LanguageContext';
import { motion } from 'framer-motion';
import { Activity, ShieldCheck, Database, MapPin, TrendingUp, Users, Cpu, CloudRain, HeartPulse, Stethoscope, Search, Layers, Zap, ArrowRight } from 'lucide-react';

const FadeIn = ({ children, delay = 0, y = 20 }) => (
  <motion.div
    initial={{ opacity: 0, y }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.7, delay, ease: "easeOut" }}
  >
    {children}
  </motion.div>
);

const GlassCard = ({ children, className = "" }) => (
  <div className={`bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl hover:shadow-neon-cyan/10 transition-all duration-300 hover:-translate-y-1 ${className}`}>
    {children}
  </div>
);

const HeroHomepage = () => {
  const { t } = useLanguage();
  return (
    <div className="w-full bg-slate-950 text-slate-200">
      
      {/* 1. Cinematic Hero Section */}
      <section className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden pt-20 pb-24 md:pb-32">
        {/* Video Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-slate-950/70 z-10"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/50 z-10"></div>
          <video 
            autoPlay 
            muted 
            loop 
            playsInline
            className="w-full h-full object-cover"
          >
            <source src="/Aarogyanet AI promo video.mp4" type="video/mp4" />
          </video>
        </div>

        {/* Hero Content */}
        <div className="relative z-20 max-w-7xl mx-auto px-4 md:px-8 text-center flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse"></span>
            <span className="text-xs font-bold tracking-widest uppercase text-neon-cyan">ArogyaNet AI Beta Version</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 leading-tight max-w-4xl"
          >
            {t('hero_title1')} <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan via-blue-400 to-purple-500">
              {t('hero_title2')}
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg md:text-xl text-slate-300 max-w-2xl mb-10 leading-relaxed"
          >
            {t('hero_desc')}
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link 
              to="/signup" 
              className="px-8 py-4 rounded-xl bg-neon-cyan hover:bg-cyan-400 text-slate-900 font-bold tracking-wider transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)]"
            >
              Get Started
            </Link>
            <Link 
              to="/analytics" 
              className="px-8 py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold tracking-wider transition-all"
            >
              Explore National Data
            </Link>
          </motion.div>
        </div>
      </section>

      {/* 2. The Mission Section */}
      <section className="py-24 relative z-10 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <FadeIn>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">{t('why_title')}</h2>
              <p className="text-slate-400 text-lg leading-relaxed">
                {t('why_desc')}
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Database, title: t('unified_data'), desc: t('unified_data_desc') },
              { icon: Zap, title: t('pred_analytics'), desc: t('pred_analytics_desc') },
              { icon: Search, title: t('cit_transparency'), desc: t('cit_transparency_desc') }
            ].map((item, idx) => (
              <FadeIn key={idx} delay={idx * 0.2}>
                <GlassCard className="p-8 h-full">
                  <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-6">
                    <item.icon className="text-blue-400" size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-slate-400 leading-relaxed">{item.desc}</p>
                </GlassCard>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Capabilities Section */}
      <section className="py-24 relative z-10 bg-slate-900 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <FadeIn>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-16 text-center">{t('dual_intel')}</h2>
          </FadeIn>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-24">
            {/* Citizen Side */}
            <FadeIn delay={0.2} x={-20}>
              <div className="p-8 md:p-10 rounded-3xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-neon-cyan/5 rounded-full blur-3xl group-hover:bg-neon-cyan/10 transition-colors"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-8">
                    <Users className="text-neon-cyan" size={28} />
                    <h3 className="text-2xl font-bold text-white">{t('for_citizens')}</h3>
                  </div>
                  <ul className="space-y-6">
                    {[
                      { icon: MapPin, text: t('cit_point1') },
                      { icon: Activity, text: t('cit_point2') },
                      { icon: Stethoscope, text: t('cit_point3') },
                      { icon: ShieldCheck, text: t('cit_point4') }
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-start gap-4">
                        <div className="mt-1 w-6 h-6 rounded-full bg-neon-cyan/10 flex items-center justify-center flex-shrink-0">
                          <item.icon className="text-neon-cyan" size={12} />
                        </div>
                        <span className="text-slate-300 leading-relaxed">{item.text}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/analytics" className="inline-flex items-center gap-2 mt-10 text-neon-cyan font-bold hover:gap-3 transition-all">
                    {t('view_dashboard')} <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </FadeIn>

            {/* Government Side */}
            <FadeIn delay={0.4} x={20}>
              <div className="p-8 md:p-10 rounded-3xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl group-hover:bg-purple-500/10 transition-colors"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-8">
                    <Database className="text-purple-400" size={28} />
                    <h3 className="text-2xl font-bold text-white">{t('for_govt')}</h3>
                  </div>
                  <ul className="space-y-6">
                    {[
                      { icon: TrendingUp, text: t('gov_point1') },
                      { icon: Layers, text: t('gov_point2') },
                      { icon: HeartPulse, text: t('gov_point3') },
                      { icon: Cpu, text: t('gov_point4') }
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-start gap-4">
                        <div className="mt-1 w-6 h-6 rounded-full bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                          <item.icon className="text-purple-400" size={12} />
                        </div>
                        <span className="text-slate-300 leading-relaxed">{item.text}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/login" className="inline-flex items-center gap-2 mt-10 text-purple-400 font-bold hover:gap-3 transition-all">
                    {t('access_command')} <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </FadeIn>
          </div>

          {/* AI Assistant Section */}
          <FadeIn delay={0.2}>
            <div className="rounded-3xl bg-gradient-to-r from-neon-cyan/20 via-blue-600/20 to-purple-500/20 p-[1px]">
              <div className="rounded-3xl bg-slate-950 p-10 md:p-16 flex flex-col md:flex-row items-center gap-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-neon-cyan/5 rounded-full blur-[100px]"></div>
                
                <div className="flex-1 relative z-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6">
                    <span className="text-xs font-bold tracking-widest uppercase text-neon-cyan">Citizen Feature</span>
                  </div>
                  <h3 className="text-3xl md:text-4xl font-black text-white mb-6">
                    ArogyaNet AI Citizen Assistant
                  </h3>
                  <p className="text-slate-400 text-lg leading-relaxed mb-8">
                    Need to find the nearest primary healthcare center? Looking for emergency blood availability? 
                    Our intelligent assistant connects citizens directly to national healthcare intelligence.
                  </p>
                  
                  <ul className="space-y-4 mb-8">
                    {[
                      'Instant facility location services',
                      'Healthcare guidelines & disease advisories',
                      'Emergency SOS broadcast instructions',
                      'Available 24/7 with multi-language support'
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-slate-300">
                        <div className="w-6 h-6 rounded-full bg-neon-cyan/20 flex items-center justify-center flex-shrink-0 text-neon-cyan">
                          <ShieldCheck size={14} />
                        </div>
                        {item}
                      </li>
                    ))}
                  </ul>

                  <button 
                    onClick={() => window.dispatchEvent(new CustomEvent('open-chatbot'))}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-slate-900 font-bold hover:bg-slate-200 transition-colors"
                  >
                    Try the Assistant <ArrowRight size={18} />
                  </button>
                </div>

                <div className="flex-1 relative z-10 hidden md:block">
                  <div className="w-full max-w-sm mx-auto bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-2xl relative">
                    <div className="absolute -top-4 -right-4 w-12 h-12 rounded-xl bg-neon-cyan flex items-center justify-center text-slate-900 shadow-lg animate-bounce">
                      <Cpu size={24} />
                    </div>
                    <div className="space-y-4">
                      <div className="bg-slate-800 p-4 rounded-xl rounded-tl-sm w-[80%] text-sm text-white">
                        Hello! I need to find the nearest PHC with available doctors.
                      </div>
                      <div className="bg-neon-cyan/10 border border-neon-cyan/30 p-4 rounded-xl rounded-tr-sm w-[90%] ml-auto text-sm text-white">
                        I found 3 Primary Health Centres within 5km of your location. The nearest one is Civil Lines PHC. Would you like directions?
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* 4. Future Vision (Coming Soon) */}
      <section className="py-24 relative z-10 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <FadeIn>
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{t('future_roadmap')}</h2>
                <p className="text-slate-400 text-lg max-w-2xl">
                  {t('future_roadmap_desc')}
                </p>
              </div>
              <div className="px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-bold uppercase tracking-wider inline-block">
                Coming Phase 2
              </div>
            </div>
          </FadeIn>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[
              { icon: CloudRain, title: t('aqi_heatwave'), tag: "Environment" },
              { icon: HeartPulse, title: t('maternal_child'), tag: "Demographics" },
              { icon: ShieldCheck, title: t('vaccination_intel'), tag: "Immunization" },
              { icon: Users, title: t('census_pop'), tag: "Statistics" }
            ].map((item, idx) => (
              <FadeIn key={idx} delay={idx * 0.1}>
                <div className="p-6 rounded-2xl bg-white/5 border border-white/5 opacity-70 hover:opacity-100 transition-opacity flex flex-col items-center text-center h-full">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center mb-4">
                    <item.icon className="text-slate-400" size={20} />
                  </div>
                  <h4 className="font-bold text-white mb-1">{item.title}</h4>
                  <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">{item.tag}</span>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default HeroHomepage;
