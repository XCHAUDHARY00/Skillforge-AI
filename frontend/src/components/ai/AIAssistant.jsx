import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Send } from 'lucide-react';
import api from '../../api';
import { LogoMark } from '../BrandLogo';

const suggestions = [
  "What should I learn today?",
  "What is my biggest skill gap?",
  "Am I ready for backend jobs?",
  "Suggest a project for this week",
];

const TypingIndicator = () => (
  <div className="flex items-end gap-2">
    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-[11px] flex-shrink-0">
      ✨
    </div>
    <div className="px-3 py-2.5 rounded-2xl rounded-tl-sm flex gap-1 items-center"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--bg-card-border)' }}>
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
          className="w-1.5 h-1.5 rounded-full bg-indigo-400"
        />
      ))}
    </div>
  </div>
);

const AIAssistant = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, sender: 'ai', text: "Hi! I'm your SkillForge AI Coach. Ask me anything about your career journey. 🚀" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [messages, open]);

  const sendMessage = async (text) => {
    const msgText = text || input.trim();
    if (!msgText || loading) return;
    setInput('');

    const userMsg = { id: Date.now(), sender: 'user', text: msgText };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    // ✅ 6s baad "waking up" message dikhao (Render cold start handle)
    const slowTimer = setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now() + 0.5,
        sender: 'ai',
        text: '⏳ Server is waking up... please wait a moment.',
        isTemp: true,
      }]);
    }, 6000);

    try {
      const response = await api.post('/chat/send/', { message: msgText });
      clearTimeout(slowTimer);

      // Remove temp "waking up" message if it was added
      setMessages(prev => prev.filter(m => !m.isTemp));

      if (response.data.status === 'success') {
        const aiMsg = { id: Date.now() + 1, sender: 'ai', text: response.data.data.response };
        setMessages(prev => [...prev, aiMsg]);
      } else {
        setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'ai', text: "I'm having trouble right now. Please try again." }]);
      }
    } catch (err) {
      clearTimeout(slowTimer);
      setMessages(prev => prev.filter(m => !m.isTemp));
      const errText = err.code === 'ECONNABORTED'
        ? '⏱️ Request timed out. Try again in 30 seconds!'
        : "Sorry, I couldn't connect. Please try again shortly.";
      setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'ai', text: errText }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <motion.button
        onClick={() => setOpen(!open)}
        className="fixed bottom-24 right-6 md:bottom-8 md:right-8 w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-600 to-indigo-700 text-white flex items-center justify-center z-40"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        style={{ boxShadow: open ? '0 0 0 2px rgba(99,102,241,0.5), 0 8px 30px rgba(99,102,241,0.4)' : '0 0 25px rgba(99,102,241,0.35), 0 8px 25px rgba(0,0,0,0.3)' }}
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
              <X size={20} />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
              <Sparkles size={20} />
            </motion.div>
          )}
        </AnimatePresence>
        {/* Pulse ring — only when closed */}
        {!open && (
          <motion.span
            className="absolute inset-0 rounded-2xl"
            animate={{ boxShadow: ['0 0 0 0px rgba(99,102,241,0.4)', '0 0 0 10px rgba(99,102,241,0)'] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="fixed bottom-44 right-6 md:bottom-28 md:right-8 w-80 md:w-[360px] rounded-2xl overflow-hidden z-40 flex flex-col"
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--bg-card-border)',
              boxShadow: '0 0 0 1px rgba(99,102,241,0.1), 0 24px 60px rgba(0,0,0,0.45)',
              maxHeight: '480px',
            }}
          >
            {/* Header */}
            <div className="px-4 py-3 flex items-center gap-3 flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #ec4899 100%)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <div className="flex-shrink-0">
                <LogoMark size={30} animated={false} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-1">
                  <span className="text-white font-extrabold text-sm leading-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Skill</span>
                  <span className="font-extrabold text-sm leading-tight" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#fbbf24' }}>Forge</span>
                  <span className="text-[9px] font-bold text-white/50 ml-0.5">AI</span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <motion.div
                    animate={{ opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-1.5 h-1.5 bg-emerald-400 rounded-full"
                  />
                  <span className="text-white/55 text-[10px]">Career advisor · Online</span>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors flex-shrink-0"
              >
                <X size={13} className="text-white/80" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar" style={{ minHeight: 0 }}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'ai' && (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-[11px] flex-shrink-0 mb-0.5">
                      ✨
                    </div>
                  )}
                  <div className={`max-w-[78%] px-3 py-2.5 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white rounded-2xl rounded-br-sm shadow-md shadow-indigo-500/20'
                      : 'rounded-2xl rounded-tl-sm'
                  }`}
                    style={msg.sender === 'ai' ? {
                      background: 'var(--bg-card)',
                      border: '1px solid var(--bg-card-border)',
                      color: 'var(--text-primary)',
                    } : {}}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              {loading && <TypingIndicator />}
              <div ref={endRef} />
            </div>

            {/* Quick suggestions */}
            <div className="px-3 py-2 flex gap-1.5 overflow-x-auto no-scrollbar flex-shrink-0"
              style={{ borderTop: '1px solid var(--bg-card-border)' }}>
              {suggestions.slice(0, 3).map((s, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(s)}
                  disabled={loading}
                  className="flex-shrink-0 text-[10px] px-2.5 py-1.5 rounded-lg border transition-all hover:border-indigo-500/40 disabled:opacity-40 whitespace-nowrap"
                  style={{ background: 'var(--bg-card)', borderColor: 'var(--bg-card-border)', color: 'var(--text-secondary)' }}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="p-3 flex-shrink-0" style={{ borderTop: '1px solid var(--bg-card-border)' }}>
              <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex gap-2">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Ask about your career..."
                  disabled={loading}
                  className="flex-1 rounded-xl px-3 py-2.5 text-xs transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  style={{
                    background: 'var(--bg-input)',
                    border: '1px solid var(--bg-card-border)',
                    color: 'var(--text-primary)',
                  }}
                  onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.5)'}
                  onBlur={e => e.target.style.borderColor = 'var(--bg-card-border)'}
                />
                <motion.button
                  type="submit"
                  disabled={!input.trim() || loading}
                  whileHover={input.trim() && !loading ? { scale: 1.08 } : {}}
                  whileTap={input.trim() && !loading ? { scale: 0.92 } : {}}
                  className="w-9 h-9 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-opacity flex-shrink-0 shadow-md shadow-indigo-500/25"
                >
                  <Send size={13} />
                </motion.button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIAssistant;
