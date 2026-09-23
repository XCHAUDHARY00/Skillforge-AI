import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, Sparkles, ChevronLeft, Trash2 } from 'lucide-react';
import api from '../api';
import AppLayout from '../components/layout/AppLayout';

function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChatHistory = async () => {
    try {
      setInitialLoading(true);
      setError(null);
      const response = await api.get('/chat/history/');
      if (response.data.status === 'success') {
        setMessages(response.data.data);
      }
    } catch (err) {
      setError("Failed to load chat history.");
    } finally {
      setInitialLoading(false);
      setTimeout(scrollToBottom, 100);
    }
  };

  useEffect(() => { fetchChatHistory(); }, []);
  useEffect(() => { scrollToBottom(); }, [messages, loading]);

  const handleSend = async (e) => {
    e?.preventDefault();
    const msgText = typeof e === 'string' ? e : input.trim();
    if (!msgText || loading) return;

    setInput('');
    const tempUserMsg = { id: Date.now(), sender: 'user', message: msgText, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, tempUserMsg]);
    setLoading(true);
    setError(null);

    // ✅ Agar 6 seconds mein response nahi aaya → user ko helpful message dikhao
    const slowTimer = setTimeout(() => {
      setError('⏳ Server waking up (Render free tier)... Please wait ~30 seconds.');
    }, 6000);

    try {
      const response = await api.post('/chat/send/', { message: msgText });
      clearTimeout(slowTimer);
      setError(null); // Clear the "waking up" message on success
      if (response.data.status === 'success') {
        const aiReply = { id: Date.now() + 1, sender: 'ai', message: response.data.data.response, timestamp: new Date().toISOString() };
        setMessages(prev => [...prev, aiReply]);
      } else {
        setError(response.data.message || "Something went wrong.");
      }
    } catch (err) {
      clearTimeout(slowTimer);
      if (err.code === 'ECONNABORTED') {
        setError("⏱️ Request timed out. The server may be sleeping. Try again in 30 seconds!");
      } else {
        setError("Failed to get response from AI Coach. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const quickSend = (text) => {
    setInput(text);
    setTimeout(() => handleSend(text), 100);
  };

  const suggestions = [
    "What should I learn today?",
    "Am I ready for backend jobs?",
    "What's my biggest skill gap?",
    "Suggest a project for this week",
  ];

  return (
    <AppLayout title="AI Career Coach" subtitle="Powered by Gemini · Context-aware career advice">
      <div className="flex flex-col h-[calc(100vh-73px)]">
        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-4 md:px-6 py-5 space-y-4 max-w-4xl w-full mx-auto">
          {initialLoading ? (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <div className="w-10 h-10 border-2 border-t-indigo-500 border-r-indigo-500 border-b-transparent border-l-transparent rounded-full animate-spin" />
              <p className="text-xs text-[#55556a] animate-pulse">Loading your career conversation...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center glow-indigo">
                <Sparkles size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white mb-2">Ask your AI Career Coach</h2>
                <p className="text-xs text-[#55556a] leading-relaxed">
                  I know your skills, goals, and career gaps. Ask me anything about your journey.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-2 w-full">
                {suggestions.map((s, i) => (
                  <motion.button
                    key={i}
                    onClick={() => quickSend(s)}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="text-left text-xs bg-[#0d0d12] border border-[#1a1a25] hover:border-indigo-500/30 hover:bg-[#111118] px-4 py-3 rounded-xl text-[#9898b0] hover:text-white transition-all"
                  >
                    💬 {s}
                  </motion.button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, index) => {
                const isUser = msg.sender === 'user';
                return (
                  <motion.div
                    key={msg.id || index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-start gap-2.5 max-w-[85%] md:max-w-[75%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-[11px] font-bold flex-shrink-0 ${
                        isUser ? 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white' : 'bg-[#111118] border border-[#2a2a38]'
                      }`}>
                        {isUser ? 'U' : <Sparkles size={12} className="text-indigo-400" />}
                      </div>
                      <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                        isUser
                          ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-tr-none'
                          : 'bg-[#0d0d12] border border-[#1a1a25] text-[#d0d0e8] rounded-tl-none'
                      }`}>
                        <p className="whitespace-pre-wrap">{msg.message}</p>
                        <span className="block text-[9px] opacity-50 mt-1.5 text-right">
                          {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {loading && (
                <div className="flex justify-start">
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-xl bg-[#111118] border border-[#2a2a38] flex items-center justify-center">
                      <Sparkles size={12} className="text-indigo-400" />
                    </div>
                    <div className="bg-[#0d0d12] border border-[#1a1a25] px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-1">
                      {[0, 1, 2].map(i => (
                        <div key={i} className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="flex justify-center">
                  <div className="px-4 py-2 bg-red-500/10 border border-red-500/25 rounded-xl text-xs text-red-400">
                    ⚠ {error}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-[#1a1a25] bg-[#080810] px-4 py-4">
          <form onSubmit={handleSend} className="max-w-4xl mx-auto flex items-center gap-3">
            <div className="flex-1 flex items-center bg-[#0d0d12] border border-[#1a1a25] rounded-2xl px-4 py-2 focus-within:border-indigo-500/50 transition-all">
              <input
                type="text"
                placeholder={loading ? "AI is thinking..." : "Ask your career coach..."}
                className="flex-1 bg-transparent text-sm text-white placeholder-[#55556a] focus:outline-none"
                value={input}
                onChange={e => setInput(e.target.value)}
                disabled={loading}
              />
            </div>
            <motion.button
              type="submit"
              disabled={!input.trim() || loading}
              whileHover={!loading && input.trim() ? { scale: 1.05 } : {}}
              whileTap={!loading && input.trim() ? { scale: 0.95 } : {}}
              className="w-10 h-10 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-all flex-shrink-0"
            >
              <Send size={15} />
            </motion.button>
          </form>
          <p className="text-[10px] text-[#2a2a38] text-center mt-2">
            CareerMind AI Coach · Powered by Gemini · Context from your profile
          </p>
        </div>
      </div>
    </AppLayout>
  );
}

export default Chat;
