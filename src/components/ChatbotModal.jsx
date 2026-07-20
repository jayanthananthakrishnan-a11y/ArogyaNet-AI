import React, { useState, useRef, useEffect } from 'react';
import { Cpu, Send, X, Loader2, Bot, User } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { useCitizenAuth } from '../CitizenAuthContext';
import { useLanguage } from '../LanguageContext';
import { Link } from 'react-router-dom';

const ChatbotModal = ({ isOpen, onClose }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hello! I am the ArogyaNet AI Assistant. How can I help you today?' }
  ]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { citizenUser } = useCitizenAuth();
  const { language } = useLanguage();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!isOpen) return null;

  const handleSend = async (e, textOverride = null) => {
    if (e) e.preventDefault();
    const userMessage = textOverride || input.trim();
    if (!userMessage) return;

    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    if (!textOverride) setInput('');
    setLoading(true);

    try {
      if (citizenUser) {
        const token = sessionStorage.getItem('citizenToken');
        const res = await fetch(`/api/public/chat`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ message: userMessage })
        });
        const data = await res.json();
        if (data.success) {
            setMessages(prev => [...prev, { role: 'assistant', text: data.reply }]);
        } else {
            setMessages(prev => [...prev, { role: 'assistant', text: data.error || 'Sorry, an error occurred.' }]);
        }
      } else if (user) {
        const res = await fetch(`/api/chatbot`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            query: userMessage,
            role: user?.role,
            center_id: user?.center_id,
            language
          })
        });
        const data = await res.json();
        setMessages(prev => [...prev, { role: 'assistant', text: data.reply }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', text: 'Please log in to use the AI Assistant.' }]);
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'assistant', text: 'Sorry, I encountered an error connecting to the intelligence core.' }]);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    "What is ArogyaNet AI?",
    "How to navigate the portal?",
    "Where can I find national data?"
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-black border border-neon-cyan/50 rounded-2xl w-full max-w-lg overflow-hidden shadow-glow-cyan animate-in fade-in zoom-in duration-300 flex flex-col h-[600px]">
        {/* Header */}
        <div className="bg-neon-cyan/10 p-5 flex justify-between items-center border-b border-neon-cyan/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-neon-cyan/20 p-2 rounded-lg text-neon-cyan shadow-glow-cyan">
              <Cpu size={24} />
            </div>
            <div>
              <h3 className="text-lg font-black text-neon-cyan uppercase tracking-widest">AI Assistant</h3>
              <p className="text-neon-cyan/70 text-[10px] font-mono tracking-widest uppercase mt-0.5">District Intelligence Core</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-neon-purple/20 text-neon-purple border border-neon-purple/50' : 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/50'}`}>
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={`max-w-[80%] rounded-2xl p-4 text-sm ${msg.role === 'user' ? 'bg-neon-purple/10 text-white border border-neon-purple/30 rounded-tr-none' : 'bg-neon-cyan/5 text-slate-200 border border-neon-cyan/20 rounded-tl-none'}`}>
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="shrink-0 w-8 h-8 rounded-full bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/50 flex items-center justify-center">
                <Bot size={16} />
              </div>
              <div className="bg-neon-cyan/5 border border-neon-cyan/20 rounded-2xl rounded-tl-none p-4 flex items-center gap-2 text-neon-cyan/70">
                <Loader2 size={16} className="animate-spin" /> Thinking...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        <div className="px-5 pb-2 flex gap-2 overflow-x-auto custom-scrollbar shrink-0">
          {quickActions.map((action, idx) => (
            <button 
              key={idx}
              onClick={() => { handleSend(null, action); }}
              className="shrink-0 text-[10px] uppercase tracking-widest font-bold bg-white/5 border border-white/10 hover:border-neon-cyan/50 hover:text-neon-cyan text-slate-400 px-3 py-1.5 rounded-full transition-colors"
            >
              {action}
            </button>
          ))}
        </div>

        {/* Input Area */}
        <div className="p-5 border-t border-white/10 shrink-0 bg-black/60">
          <form onSubmit={handleSend} className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about the district..."
              className="w-full bg-black/40 border border-neon-cyan/30 rounded-xl py-3 pl-4 pr-12 text-sm text-white focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan outline-none"
              disabled={loading}
            />
            <button 
              type="submit"
              disabled={!input.trim() || loading}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-neon-cyan hover:bg-neon-cyan/20 rounded-lg transition-colors disabled:opacity-50"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatbotModal;
