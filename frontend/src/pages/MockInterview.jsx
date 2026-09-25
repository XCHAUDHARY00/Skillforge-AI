import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Editor from '@monaco-editor/react';
import { Mic, Play, Timer, ChevronRight, Star, MessageSquare, TrendingUp, Loader, AlertCircle, Zap, Brain, Target } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import AIAssistant from '../components/ai/AIAssistant';
import Tilt3DCard from '../components/Tilt3DCard';
import api from '../api';

const ScoreBar = ({ label, score, color }) => (
  <div>
    <div className="flex justify-between text-xs mb-1.5" style={{ color: 'var(--text-secondary)' }}>
      <span>{label}</span>
      <span className="font-bold" style={{ color, textShadow: `0 0 8px ${color}60` }}>{score}</span>
    </div>
    <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      <motion.div initial={{ width: 0 }} animate={{ width: `${score}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="h-full rounded-full"
        style={{ background: `linear-gradient(90deg, ${color}, ${color}bb)`, boxShadow: `0 0 6px ${color}60` }} />
    </div>
  </div>
);

const MockInterview = () => {
  const [phase, setPhase] = useState('setup');
  const [role, setRole] = useState('Backend Developer');
  const [difficulty, setDifficulty] = useState('Medium');
  const [interviewType, setInterviewType] = useState('Technical');

  const [sessionId, setSessionId] = useState(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [currentQuestionText, setCurrentQuestionText] = useState('');
  const [isCoding, setIsCoding] = useState(false);
  const [answer, setAnswer] = useState('');
  const [codeOutput, setCodeOutput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [language, setLanguage] = useState('python');
  const [timeLeft, setTimeLeft] = useState(600);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [result, setResult] = useState(null);
  const [lastInterview, setLastInterview] = useState(null);
  const [loadingLast, setLoadingLast] = useState(true);

  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState(null);
  const recognitionRef = useRef(null);

  const fetchLastInterview = async () => {
    try {
      setLoadingLast(true);
      const response = await api.get('/interview/last/');
      if (response.data.status === 'success' && response.data.data) setLastInterview(response.data.data);
    } catch (err) { console.error("Error fetching last interview:", err); }
    finally { setLoadingLast(false); }
  };

  useEffect(() => { fetchLastInterview(); }, []);

  const speakText = (text) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel(); // Stop any currently playing speech
    
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    
    // Try to find a professional voice
    const preferredVoice = voices.find(v => 
      v.name.includes('Google') || 
      v.name.includes('Samantha') || 
      v.name.includes('Zira') || 
      v.name.includes('Fiona')
    ) || voices.find(v => v.lang.startsWith('en'));
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    utterance.rate = 0.95; // slightly slower for better comprehension
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    // When the phase is active and a new question comes in, read it aloud.
    if (phase === 'active' && currentQuestionText) {
      // Small timeout to ensure voices are loaded on some browsers
      setTimeout(() => speakText(currentQuestionText), 100);
    }
    
    // Cleanup: stop speaking if we leave the interview phase or unmount
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [currentQuestionText, phase]);

  // Use a ref to hold the latest handleNextQuestion so the interval callback
  // never captures a stale closure.
  const handleNextQuestionRef = useRef(null);

  useEffect(() => {
    if (phase !== 'active' || timeLeft <= 0 || isLoading) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          // Call via ref so we always get the latest version
          setTimeout(() => handleNextQuestionRef.current?.(), 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  // Intentionally omit timeLeft — re-adding it would reset the interval every tick.
  // phase and isLoading are the only meaningful re-trigger conditions.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, isLoading]);

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { setSpeechError("Voice input not supported. Use Chrome or Safari."); return; }
    try {
      const rec = new SpeechRecognition();
      rec.continuous = true; rec.interimResults = false; rec.lang = 'en-US';
      rec.onstart = () => { setIsListening(true); setSpeechError(null); };
      rec.onresult = (event) => {
        const transcript = Array.from(event.results).map(res => res[0].transcript).join('');
        setAnswer(prev => prev ? prev + ' ' + transcript : transcript);
      };
      rec.onerror = (event) => { if (event.error !== 'no-speech') { setSpeechError(`Speech error: ${event.error}`); setIsListening(false); } };
      rec.onend = () => setIsListening(false);
      recognitionRef.current = rec;
      rec.start();
    } catch (e) { setSpeechError("Could not access microphone."); }
  };

  const stopListening = () => { if (recognitionRef.current) recognitionRef.current.stop(); setIsListening(false); };

  const handleStartInterview = async () => {
    setIsLoading(true); setError(null);
    try {
      const response = await api.post('/interview/start/', { target_role: role, difficulty, interview_type: interviewType });
      if (response.data.status === 'success') {
        setSessionId(response.data.session_id);
        setCurrentQuestionText(response.data.first_question);
        setIsCoding(response.data.is_coding);
        setCurrentQ(0);
        setTimeLeft(response.data.is_coding ? 600 : 120);
        setAnswer(''); setCodeOutput('');
        setPhase('active');
      } else { setError(response.data.message || "Failed to start interview."); }
    } catch (err) { setError("Failed to start the interview session. Please try again."); }
    finally { setIsLoading(false); }
  };

  // Keep the ref in sync with the latest function instance
  const handleNextQuestion = useCallback(async () => {
    setIsLoading(true); setError(null);
    try {
      const response = await api.post('/interview/answer/', { session_id: sessionId, answer_text: answer });
      if (response.data.status === 'success') {
        if (response.data.completed) {
          const endResponse = await api.post('/interview/end/', { session_id: sessionId });
          if (endResponse.data.status === 'success') { setResult(endResponse.data); setPhase('result'); fetchLastInterview(); }
          else { setError(endResponse.data.message || "Failed to finalize scores."); }
        } else {
          setCurrentQuestionText(response.data.next_question);
          setIsCoding(response.data.is_coding);
          setCurrentQ(q => q + 1);
          setAnswer(''); setCodeOutput('');
          setTimeLeft(response.data.is_coding ? 600 : 120);
        }
      } else { setError(response.data.message || "Failed to submit answer."); }
    } catch (err) { setError("Failed to submit answer. Please check your internet connection."); }
    finally { setIsLoading(false); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, answer]);

  // Sync ref after every render so the timer callback always calls the latest version
  handleNextQuestionRef.current = handleNextQuestion;

  const handleSkipQuestion = () => {
    // Pass '[Skipped]' directly instead of relying on the state update being
    // flushed before handleNextQuestion reads `answer`.
    setAnswer('[Skipped]');
    setCodeOutput('');
    setTimeout(() => {
      // Override the answer value for this specific call via a local flag
      handleNextQuestionSkip();
    }, 0);
  };

  const handleNextQuestionSkip = useCallback(async () => {
    setIsLoading(true); setError(null);
    try {
      const response = await api.post('/interview/answer/', { session_id: sessionId, answer_text: '[Skipped]' });
      if (response.data.status === 'success') {
        if (response.data.completed) {
          const endResponse = await api.post('/interview/end/', { session_id: sessionId });
          if (endResponse.data.status === 'success') { setResult(endResponse.data); setPhase('result'); fetchLastInterview(); }
          else { setError(endResponse.data.message || "Failed to finalize scores."); }
        } else {
          setCurrentQuestionText(response.data.next_question);
          setIsCoding(response.data.is_coding);
          setCurrentQ(q => q + 1);
          setAnswer(''); setCodeOutput('');
          setTimeLeft(response.data.is_coding ? 600 : 120);
        }
      } else { setError(response.data.message || "Failed to submit answer."); }
    } catch (err) { setError("Failed to submit answer. Please check your internet connection."); }
    finally { setIsLoading(false); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  // ─── RESULT PHASE ─────────────────────────────────────────────────────────────
  if (phase === 'result') {
    const overall = result?.scores?.overall || result?.score || 0;
    const color = overall >= 70 ? '#10b981' : overall >= 50 ? '#f59e0b' : '#ef4444';
    return (
      <AppLayout title="Interview Result" subtitle="Your performance breakdown">
        <div className="p-4 sm:p-6 max-w-3xl mx-auto">
          {/* Score hero */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-6 mb-5 relative overflow-hidden"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--bg-card-border)' }}>
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: `radial-gradient(circle at 50% 0%, ${color}10, transparent 60%)` }} />
            <div className="text-center mb-6 relative">
              <p className="text-xs uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>Interview Score</p>
              <motion.p className="text-7xl font-bold mb-1"
                initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                style={{ color, textShadow: `0 0 40px ${color}60` }}>
                {overall}
              </motion.p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>out of 100</p>
              <p className="text-xs mt-2 font-semibold" style={{ color }}>
                {overall >= 70 ? '🏆 Strong Performance' : overall >= 50 ? '📈 Room to Grow' : '💪 Keep Practicing'}
              </p>
            </div>

            <div className="space-y-4">
              {[
                { label: 'Technical Knowledge', score: result?.scores?.technical || result?.technical || 0, color: '#6366f1' },
                { label: 'Communication', score: result?.scores?.communication || result?.communication || 0, color: '#8b5cf6' },
                { label: 'Problem Solving', score: result?.scores?.problemSolving || result?.problemSolving || 0, color: '#3b82f6' },
                { label: 'Clarity', score: result?.scores?.clarity || result?.clarity || 0, color: '#14b8a6' },
                { label: 'Confidence', score: result?.scores?.confidence || result?.confidence || 0, color: '#f59e0b' },
              ].map(item => <ScoreBar key={item.label} {...item} />)}
            </div>
          </motion.div>

          {/* Summary */}
          {result?.summary && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="rounded-2xl p-5 mb-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--bg-card-border)' }}>
              <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Brain size={12} /> AI Overall Review
              </p>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{result.summary}</p>
            </motion.div>
          )}

          {/* Feedback */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="rounded-2xl p-5 mb-5"
            style={{ background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.22)' }}>
            <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-3">Detailed Feedback</p>
            <div className="space-y-3">
              {result?.strengths?.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-emerald-400 mb-2 flex items-center gap-1.5"><Zap size={11} /> Key Strengths</p>
                  <ul className="space-y-1.5">
                    {result.strengths.map((str, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                        <span className="w-1 h-1 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                        {str}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {result?.areas_to_improve?.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-amber-400 mb-2 flex items-center gap-1.5"><Target size={11} /> Areas to Improve</p>
                  <ul className="space-y-1.5">
                    {result.areas_to_improve.map((area, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                        <span className="w-1 h-1 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                        {area}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>

          <motion.button id="interview-restart-btn" onClick={() => setPhase('setup')}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.01, boxShadow: '0 0 24px rgba(99,102,241,0.3)' }}
            whileTap={{ scale: 0.99 }}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            <Play size={14} className="fill-current" /> Practice Again
          </motion.button>
        </div>
        <AIAssistant />
      </AppLayout>
    );
  }

  // ─── ACTIVE PHASE ─────────────────────────────────────────────────────────────
  if (phase === 'active') {
    const urgentTime = timeLeft <= 30;
    const timerColor = urgentTime ? '#ef4444' : timeLeft <= 60 ? '#f59e0b' : '#6366f1';

    return (
      <AppLayout title="Mock Interview" subtitle="Be confident. Take your time.">
        <div className="p-4 sm:p-6 max-w-3xl mx-auto">
          {error && (
            <div className="mb-4 p-3 rounded-xl flex items-center gap-2 text-xs text-red-400"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
              <AlertCircle size={14} /><span>{error}</span>
            </div>
          )}

          {/* Timer + progress */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <motion.div animate={urgentTime ? { scale: [1, 1.05, 1] } : {}} transition={{ repeat: Infinity, duration: 0.5 }}
              className="flex items-center gap-2 px-3 py-2 rounded-xl self-start"
              style={{ background: 'var(--bg-card)', border: `1px solid ${timerColor}40`, boxShadow: urgentTime ? `0 0 12px ${timerColor}30` : 'none' }}>
              <Timer size={14} style={{ color: timerColor }} />
              <span className="text-sm font-bold" style={{ color: timerColor }}>
                {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
              </span>
            </motion.div>
            <div className="flex items-center gap-2">
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Question {currentQ + 1} of 5</span>
              <div className="flex gap-1">
                {[0, 1, 2, 3, 4].map(i => (
                  <div key={i} className="w-2 h-2 rounded-full transition-all"
                    style={{ background: i <= currentQ ? '#6366f1' : 'var(--bg-card-border)', boxShadow: i === currentQ ? '0 0 6px rgba(99,102,241,0.6)' : 'none' }} />
                ))}
              </div>
            </div>
          </div>

          {/* Question card */}
          <motion.div key={currentQ} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-6 mb-5 relative overflow-hidden"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--bg-card-border)' }}>

            {isLoading && (
              <div className="absolute inset-0 backdrop-blur-sm flex flex-col items-center justify-center gap-3 z-10 rounded-2xl"
                style={{ background: 'rgba(0,0,0,0.5)' }}>
                <Loader size={24} className="animate-spin text-indigo-400" />
                <p className="text-xs animate-pulse" style={{ color: 'var(--text-secondary)' }}>
                  {currentQ < 4 ? "AI is evaluating your answer..." : "Finalizing your scorecard..."}
                </p>
              </div>
            )}

            <div className="flex items-start gap-4 mb-5">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 relative"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 0 20px rgba(99,102,241,0.4)' }}>
                {isListening && <div className="absolute inset-0 rounded-2xl bg-red-500/30 animate-ping" />}
                <motion.div animate={isListening ? { scale: [1, 1.2, 1] } : { scale: [1, 1.05, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}>
                  <Mic size={20} className={isListening ? "text-red-300" : "text-white"} />
                </motion.div>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <p className="text-xs font-semibold text-indigo-400">AI Interviewer</p>
                  {isCoding && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                      style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.35)', color: '#a5b4fc' }}>
                      Coding Challenge
                    </span>
                  )}
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>{currentQuestionText}</p>
              </div>
            </div>
          </motion.div>

          {isCoding ? (
            <div className="flex flex-col gap-3 mb-4">
              <div className="flex justify-between items-center">
                <select value={language} onChange={e => setLanguage(e.target.value)}
                  className="rounded-lg px-2 py-1 outline-none text-xs"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--bg-card-border)', color: 'var(--text-primary)' }}>
                  <option value="python">Python 3.10</option>
                  <option value="javascript">Node.js</option>
                </select>
                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Syntax highlighting enabled</span>
              </div>
              <div className="rounded-xl overflow-hidden h-[300px]" style={{ border: '1px solid var(--bg-card-border)' }}>
                <Editor height="100%" language={language} theme="vs-dark" value={answer}
                  onChange={val => setAnswer(val || '')}
                  options={{ minimap: { enabled: false }, fontSize: 13, padding: { top: 16 } }} />
              </div>
            </div>
          ) : (
            <textarea id="interview-answer-input" value={answer} onChange={e => setAnswer(e.target.value)}
              disabled={isLoading}
              placeholder="Type your answer here... Or use the Speak button below to talk."
              rows={6}
              className="w-full rounded-xl px-4 py-3 text-sm transition-all resize-none mb-4 focus:outline-none"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--bg-card-border)', color: 'var(--text-primary)' }}
              onFocus={e => e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)'}
              onBlur={e => e.currentTarget.style.borderColor = 'var(--bg-card-border)'} />
          )}

          {!isCoding && (
            <div className="flex flex-col gap-2 mb-4">
              <button id="interview-speak-btn" type="button"
                onMouseDown={startListening} onMouseUp={stopListening}
                onTouchStart={startListening} onTouchEnd={stopListening}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all select-none"
                style={isListening
                  ? { background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: '#fca5a5', boxShadow: '0 0 12px rgba(239,68,68,0.2)' }
                  : { background: 'var(--bg-card)', border: '1px solid var(--bg-card-border)', color: 'var(--text-secondary)' }
                }>
                <Mic size={14} className={isListening ? "animate-pulse text-red-400" : ""} />
                {isListening ? "Listening... Release to stop" : "Hold to Speak Answer"}
              </button>
              {speechError && <p className="text-[10px] text-red-400">{speechError}</p>}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <motion.button id="interview-submit-btn" onClick={handleNextQuestion} disabled={isLoading}
              whileHover={!isLoading ? { scale: 1.01, boxShadow: '0 0 20px rgba(99,102,241,0.3)' } : {}}
              whileTap={!isLoading ? { scale: 0.99 } : {}}
              className="flex-1 py-3 rounded-xl text-sm font-semibold text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              {currentQ < 4 ? <><span>Submit Answer</span><ChevronRight size={15} /></> : "Finish Interview"}
            </motion.button>
            <button id="interview-skip-btn" onClick={handleSkipQuestion} disabled={isLoading}
              className="px-5 py-3 rounded-xl text-xs transition-all disabled:opacity-50"
              style={{ border: '1px solid var(--bg-card-border)', color: 'var(--text-muted)' }}>
              Skip
            </button>
          </div>
        </div>
        <AIAssistant />
      </AppLayout>
    );
  }

  // ─── SETUP PHASE ─────────────────────────────────────────────────────────────
  return (
    <AppLayout title="Mock Interview" subtitle="Practice with AI. Get real feedback.">
      <div className="p-4 sm:p-6 max-w-3xl mx-auto">
        {error && (
          <div className="mb-4 p-3 rounded-xl flex items-center gap-2 text-xs text-red-400"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
            <AlertCircle size={14} /><span>{error}</span>
          </div>
        )}

        {/* Past score */}
        {loadingLast ? (
          <div className="rounded-2xl p-4 mb-6 flex items-center justify-center gap-2 animate-pulse"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--bg-card-border)' }}>
            <Loader size={14} className="animate-spin text-indigo-400" />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Loading recent interview history...</span>
          </div>
        ) : lastInterview ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 relative overflow-hidden"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--bg-card-border)' }}>
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(circle at 0% 50%, rgba(99,102,241,0.06), transparent 50%)' }} />
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(99,102,241,0.15)', boxShadow: '0 0 12px rgba(99,102,241,0.2)' }}>
              <Star size={16} className="text-indigo-400" />
            </div>
            <div className="relative">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Last Interview Score</p>
              <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                {lastInterview.score}/100{' '}
                <span className="text-xs font-normal" style={{ color: 'var(--text-muted)' }}>· {lastInterview.target_role} ({lastInterview.date})</span>
              </p>
            </div>
            <button id="interview-details-btn"
              onClick={() => { setResult(lastInterview); setPhase('result'); }}
              className="ml-auto text-xs text-indigo-400 hover:text-indigo-300 relative">
              View Details →
            </button>
          </motion.div>
        ) : null}

        {/* Setup card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-2xl p-6 space-y-5 relative overflow-hidden"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--bg-card-border)' }}>
          {/* Gradient accent top */}
          <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899)' }} />

          {isLoading && (
            <div className="absolute inset-0 backdrop-blur-sm flex flex-col items-center justify-center gap-3 z-10 rounded-2xl"
              style={{ background: 'rgba(0,0,0,0.5)' }}>
              <Loader size={24} className="animate-spin text-indigo-400" />
              <p className="text-xs animate-pulse" style={{ color: 'var(--text-secondary)' }}>Initializing interview session...</p>
            </div>
          )}

          <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Configure Your Interview</h2>

          {[
            { label: 'Target Role', value: role, options: ['Backend Developer', 'Full Stack Developer', 'AI Engineer', 'Data Scientist'], setter: setRole },
            { label: 'Difficulty', value: difficulty, options: ['Easy', 'Medium', 'Hard'], setter: setDifficulty },
            { label: 'Interview Type', value: interviewType, options: ['Technical', 'Behavioral', 'Mixed'], setter: setInterviewType },
          ].map(field => (
            <div key={field.label}>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>
                {field.label}
              </label>
              <div className="flex flex-wrap gap-2">
                {field.options.map(opt => (
                  <motion.button key={opt} onClick={() => field.setter(opt)} disabled={isLoading}
                    whileHover={!isLoading ? { scale: 1.03 } : {}} whileTap={!isLoading ? { scale: 0.97 } : {}}
                    className="px-4 py-2 rounded-xl text-xs font-medium transition-all"
                    style={field.value === opt
                      ? { background: 'rgba(99,102,241,0.18)', border: '1px solid rgba(99,102,241,0.45)', color: '#a5b4fc', boxShadow: '0 0 10px rgba(99,102,241,0.15)' }
                      : { border: '1px solid var(--bg-card-border)', color: 'var(--text-muted)' }
                    }>
                    {opt}
                  </motion.button>
                ))}
              </div>
            </div>
          ))}

          <motion.button id="interview-start-btn" onClick={handleStartInterview} disabled={isLoading}
            whileHover={!isLoading ? { scale: 1.01, boxShadow: '0 0 24px rgba(99,102,241,0.3)' } : {}}
            whileTap={!isLoading ? { scale: 0.99 } : {}}
            className="w-full py-3.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all mt-2 disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            <Play size={15} className="fill-current" /> Start Interview
          </motion.button>
        </motion.div>

        {/* Tips */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { icon: <MessageSquare size={14} />, label: 'Use the STAR method for behavioral questions', color: '#6366f1' },
            { icon: <TrendingUp size={14} />, label: 'Reference your actual projects for examples', color: '#10b981' },
            { icon: <Timer size={14} />, label: 'Take 5–10 seconds before answering each question', color: '#f59e0b' },
          ].map((tip, i) => (
            <Tilt3DCard key={i} maxTilt={6} scale={1.02} className="rounded-xl p-3 flex flex-col gap-2"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--bg-card-border)' }}>
              <div style={{ color: tip.color, filter: `drop-shadow(0 0 6px ${tip.color}50)` }}>{tip.icon}</div>
              <p className="text-[10px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>{tip.label}</p>
            </Tilt3DCard>
          ))}
        </motion.div>
      </div>
      <AIAssistant />
    </AppLayout>
  );
};

export default MockInterview;
