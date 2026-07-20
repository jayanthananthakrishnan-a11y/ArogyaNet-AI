import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import GlowCard from './ui/GlowCard';
import { MessageSquare, Send, Trash2 } from 'lucide-react';

const DirectMessagingPage = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/messages`);
      const data = await res.json();
      setMessages(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    // Simple polling for real-time feel in the demo
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await fetch(`/api/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_role: user?.role,
          sender_name: user?.name || user?.username,
          content: newMessage.trim()
        })
      });
      setNewMessage('');
      fetchMessages();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`/api/messages/${id}`, { method: 'DELETE' });
      fetchMessages();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="absolute inset-0 p-6 md:p-8 flex flex-col max-w-4xl mx-auto w-full font-sans">
      <div className="flex justify-between items-end shrink-0 mb-6">
         <div>
             <h2 className="text-2xl font-black text-white uppercase tracking-widest flex items-center gap-3">
                 <MessageSquare className="text-neon-cyan drop-shadow-glow-cyan" />
                 Direct Channel
             </h2>
             <p className="text-slate-400 text-xs font-mono uppercase tracking-widest mt-1">Admin & MLA Communication Hub</p>
         </div>
      </div>

      <GlowCard accent="cyan" className="flex-1 flex flex-col overflow-hidden min-h-0">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar min-h-0">
          {loading && messages.length === 0 ? (
            <div className="text-center py-20 text-slate-500 font-mono animate-pulse">Loading channel...</div>
          ) : messages.length === 0 ? (
            <div className="text-center py-20 text-slate-500 font-mono">No messages yet. Start the conversation.</div>
          ) : (
            messages.map((msg, idx) => {
              const isMe = msg.sender_role === user?.role;
              return (
                <div key={msg.id || idx} className={`flex flex-col group ${isMe ? 'items-end' : 'items-start'}`}>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1 mx-1">
                    {msg.sender_name} ({msg.sender_role})
                  </span>
                  <div className={`relative max-w-[80%] p-3 rounded-xl ${isMe ? 'bg-neon-cyan/20 border border-neon-cyan/30 text-white rounded-br-sm' : 'bg-white/5 border border-white/10 text-slate-200 rounded-bl-sm'}`}>
                    {isMe && msg.id && (
                        <button 
                            onClick={() => handleDelete(msg.id)} 
                            className="absolute -left-6 top-1/2 -translate-y-1/2 p-1 text-rose-500 opacity-0 group-hover:opacity-100 hover:bg-rose-500/20 rounded transition-all"
                            title="Delete Message"
                        >
                            <Trash2 size={14} />
                        </button>
                    )}
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    <span className="text-[9px] text-slate-500 font-mono mt-2 block text-right">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-white/10 bg-black/40 shrink-0">
          <form onSubmit={handleSend} className="flex gap-4 items-end">
            <textarea 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e);
                }
              }}
              placeholder="Type your message... (Shift + Enter for new line)" 
              className="flex-1 bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-neon-cyan/50 transition-colors resize-none min-h-[50px] max-h-[150px]"
              rows={Math.min(5, Math.max(1, newMessage.split('\n').length))}
            />
            <button type="submit" disabled={!newMessage.trim()} className="bg-neon-cyan/20 text-neon-cyan px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-sm border border-neon-cyan/40 hover:bg-neon-cyan/30 transition-colors shadow-glow-cyan flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed h-[50px]">
              <Send size={18} />
            </button>
          </form>
        </div>
      </GlowCard>
    </div>
  );
};

export default DirectMessagingPage;
