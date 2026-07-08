import React from 'react';
import { Network, Radio, Send, Link as LinkIcon, Sparkles } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import GlowCard from './ui/GlowCard';

const RoadmapPage = () => {
  const { t } = useLanguage();

  const phases = [
    {
      id: 1,
      title: t('phase_1'),
      desc: t('phase_1_desc'),
      icon: Network,
      color: "text-neon-cyan",
      bg: "bg-neon-cyan/10",
      border: "border-neon-cyan/30"
    },
    {
      id: 2,
      title: t('phase_2'),
      desc: t('phase_2_desc'),
      icon: Radio,
      color: "text-neon-teal",
      bg: "bg-neon-teal/10",
      border: "border-neon-teal/30"
    },
    {
      id: 3,
      title: t('phase_3'),
      desc: t('phase_3_desc'),
      icon: Send,
      color: "text-neon-purple",
      bg: "bg-neon-purple/10",
      border: "border-neon-purple/30"
    },
    {
      id: 4,
      title: t('phase_4'),
      desc: t('phase_4_desc'),
      icon: LinkIcon,
      color: "text-neon-rose",
      bg: "bg-neon-rose/10",
      border: "border-neon-rose/30"
    }
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10 font-sans animate-in fade-in slide-in-from-bottom-4">
      <div className="flex flex-col items-center justify-center text-center space-y-4 py-12 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-neon-purple/20 to-transparent blur-3xl -z-10 rounded-full h-64 w-[80%] mx-auto"></div>
        <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-widest flex items-center gap-4">
          <Sparkles className="text-neon-cyan" size={40} />
          {t('vision_title')}
        </h1>
        <p className="text-slate-400 font-mono text-lg uppercase tracking-widest max-w-2xl">
          {t('vision_subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
        {phases.map((phase) => (
          <GlowCard key={phase.id} className="h-full border border-white/10 hover:border-white/20 transition-all p-8 flex flex-col items-start gap-6 group">
            <div className={`p-4 rounded-2xl ${phase.bg} ${phase.border} border group-hover:scale-110 transition-transform duration-300`}>
              <phase.icon size={32} className={phase.color} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-white uppercase tracking-widest mb-3">
                {phase.title}
              </h3>
              <p className="text-slate-400 font-mono leading-relaxed text-sm">
                {phase.desc}
              </p>
            </div>
          </GlowCard>
        ))}
      </div>

      {/* Decorative Visuals */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent my-16"></div>
      
      <div className="text-center text-slate-500 font-mono text-sm uppercase tracking-widest flex items-center justify-center gap-3">
        <div className="w-2 h-2 rounded-full bg-neon-cyan animate-ping"></div>
        System designed to scale
        <div className="w-2 h-2 rounded-full bg-neon-cyan animate-ping"></div>
      </div>
    </div>
  );
};

export default RoadmapPage;
