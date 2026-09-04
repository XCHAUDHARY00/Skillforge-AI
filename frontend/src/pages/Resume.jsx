import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FileText, Upload, Check, AlertTriangle, TrendingUp, Star, Loader2, RefreshCw, Sparkles } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import AIAssistant from '../components/ai/AIAssistant';
import Tilt3DCard from '../components/Tilt3DCard';
import api from '../api';

const SCORE_METRICS = [
  { key: 'ats',              label: 'ATS Readiness',     color: '#6366f1' },
  { key: 'skill_relevance',  label: 'Skill Relevance',   color: '#8b5cf6' },
  { key: 'project_strength', label: 'Project Strength',  color: '#3b82f6' },
  { key: 'impact_statements',label: 'Impact Statements', color: '#f59e0b' },
  { key: 'role_alignment',   label: 'Role Alignment',    color: '#14b8a6' },
];

const ScoreBar = ({ label, score, color, delay }) => (
  <motion.div initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay }}>
    <div className="flex justify-between text-xs mb-1.5">
      <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
      <span className="font-bold" style={{ color, textShadow: `0 0 8px ${color}50` }}>{score}%</span>
    </div>
    <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      <motion.div initial={{ width: 0 }} animate={{ width: `${score}%` }}
        transition={{ delay: delay + 0.2, duration: 0.8, ease: 'easeOut' }}
        className="h-full rounded-full"
        style={{ background: `linear-gradient(90deg, ${color}, ${color}bb)`, boxShadow: `0 0 6px ${color}50` }} />
    </div>
  </motion.div>
);

// Animated SVG score ring
const ScoreRingBig = ({ score }) => {
  const color = score >= 75 ? '#10b981' : score >= 55 ? '#f59e0b' : '#ef4444';
  const glow = score >= 75 ? 'rgba(16,185,129,0.5)' : score >= 55 ? 'rgba(245,158,11,0.5)' : 'rgba(239,68,68,0.5)';
  const circumference = 2 * Math.PI * 48;
  const dash = (score / 100) * circumference;

  return (
    <div className="relative w-28 h-28 mx-auto mb-3">
      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
        <circle cx="60" cy="60" r="48" fill="none" stroke="var(--bg-primary)" strokeWidth="7" />
        {/* Track glow */}
        <circle cx="60" cy="60" r="48" fill="none" stroke={`${color}15`} strokeWidth="12" />
        <motion.circle cx="60" cy="60" r="48" fill="none" stroke={color} strokeWidth="7"
          strokeLinecap="round"
          initial={{ strokeDasharray: `0 ${circumference}` }}
          animate={{ strokeDasharray: `${dash} ${circumference}` }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
          style={{ filter: `drop-shadow(0 0 10px ${glow})` }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <motion.p className="text-2xl font-bold" style={{ color, textShadow: `0 0 16px ${glow}` }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
            {score}
          </motion.p>
        </div>
      </div>
    </div>
  );
};

const Resume = () => {
  const [analysis, setAnalysis] = useState(null);
  const [filename, setFilename] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const fileRef = useRef(null);

  useEffect(() => { loadAnalysis(); }, []);

  const loadAnalysis = async () => {
    setLoading(true);
    try {
      const res = await api.get('/resume/analysis/');
      if (res.data?.status === 'success') { setAnalysis(res.data.data); setFilename(res.data.filename); }
    } catch (e) { /* 404 = no resume yet */ }
    finally { setLoading(false); }
  };

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.pdf')) { setError('Only PDF files are supported.'); return; }
    setError(''); setUploading(true);
    const formData = new FormData();
    formData.append('resume', file);
    try {
      const res = await api.post('/resume/upload/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (res.data?.status === 'success') { setAnalysis(res.data.data); setFilename(res.data.filename); }
    } catch (e) { setError(e.response?.data?.message || 'Upload failed. Please try again.'); }
    finally { setUploading(false); }
  };

  if (loading) {
    return (
      <AppLayout title="Resume Intelligence" subtitle="AI-powered resume analysis">
        <div className="flex items-center justify-center min-h-[60vh] gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading your resume data...</span>
        </div>
        <AIAssistant />
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Resume Intelligence" subtitle="AI-powered resume analysis">
      <div className="p-6 max-w-5xl mx-auto space-y-5">

        {/* Upload zone */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer relative overflow-hidden"
          style={{
            borderColor: dragging ? '#6366f1' : 'var(--bg-card-border)',
            background: dragging ? 'rgba(99,102,241,0.05)' : 'var(--bg-card)',
            boxShadow: dragging ? '0 0 30px rgba(99,102,241,0.15)' : 'none',
          }}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
          onClick={() => !uploading && fileRef.current?.click()}>

          {dragging && (
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(99,102,241,0.1), transparent 70%)' }} />
          )}

          <input ref={fileRef} type="file" accept=".pdf" className="hidden" id="resume-file-input"
            onChange={e => handleFile(e.target.files[0])} />

          {uploading ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: 'rgba(99,102,241,0.12)', boxShadow: '0 0 20px rgba(99,102,241,0.25)' }}>
                <Loader2 size={22} className="animate-spin text-indigo-400" />
              </div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Uploading & analyzing with AI…</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>This may take 10–20 seconds</p>
            </div>
          ) : analysis && filename ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', boxShadow: '0 0 20px rgba(16,185,129,0.2)' }}>
                <Check size={20} className="text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{filename}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Uploaded · Analyzed · AI scored</p>
              </div>
              <button id="resume-reupload-btn"
                className="text-xs flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors"
                style={{ color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.3)' }}
                onClick={e => { e.stopPropagation(); fileRef.current?.click(); }}>
                <RefreshCw size={11} /> Upload New Version
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="w-14 h-14 rounded-2xl border flex items-center justify-center"
                style={{ background: 'var(--bg-secondary)', borderColor: 'var(--bg-card-border)' }}>
                <Upload size={22} style={{ color: 'var(--text-muted)' }} />
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Drop your resume here</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>PDF only, max 10MB</p>
              </div>
              <button id="resume-browse-btn"
                className="px-5 py-2 rounded-xl text-xs font-semibold transition-all"
                style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)', color: '#a5b4fc' }}
                onClick={e => { e.stopPropagation(); fileRef.current?.click(); }}>
                Browse Files
              </button>
            </div>
          )}
          {error && <p className="text-xs text-red-400 mt-3">{error}</p>}
        </motion.div>

        {analysis && (
          <>
            {/* Score + breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Tilt3DCard maxTilt={8} scale={1.03}
                className="md:col-span-1 rounded-2xl p-5 flex flex-col items-center justify-center text-center"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--bg-card-border)' }}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                  <ScoreRingBig score={analysis.score} />
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Resume Score</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                    {analysis.score >= 80 ? '✨ Strong Resume' : analysis.score >= 60 ? '📈 Room for improvement' : '🔧 Needs work'}
                  </p>
                </motion.div>
              </Tilt3DCard>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                className="md:col-span-2 rounded-2xl p-5 space-y-4"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--bg-card-border)' }}>
                <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Section Breakdown</h3>
                {SCORE_METRICS.map((m, i) => (
                  <ScoreBar key={m.key} label={m.label} score={analysis[m.key]} color={m.color} delay={0.2 + i * 0.05} />
                ))}
              </motion.div>
            </div>

            {/* Evidence consistency */}
            {analysis.consistency_points?.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--bg-card-border)' }}>
                <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Evidence Consistency</h3>
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-lg font-bold text-emerald-400" style={{ textShadow: '0 0 12px rgba(16,185,129,0.4)' }}>{analysis.evidence_consistency}%</p>
                    <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Resume ↔ GitHub</p>
                  </div>
                  <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${analysis.evidence_consistency}%` }}
                      transition={{ delay: 0.5, duration: 0.8, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ background: 'linear-gradient(90deg, #10b981, #14b8a6)', boxShadow: '0 0 8px rgba(16,185,129,0.4)' }} />
                  </div>
                </div>
                <div className="space-y-2">
                  {analysis.consistency_points.map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: item.ok ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.12)', boxShadow: item.ok ? '0 0 6px rgba(16,185,129,0.3)' : '0 0 6px rgba(245,158,11,0.2)' }}>
                        {item.ok ? <Check size={9} className="text-emerald-400" /> : <AlertTriangle size={9} className="text-amber-400" />}
                      </div>
                      <span className="text-xs" style={{ color: item.ok ? 'var(--text-secondary)' : '#fbbf24' }}>{item.text}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* AI Tips */}
            {analysis.ai_tips?.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                className="rounded-2xl p-5"
                style={{ background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.22)' }}>
                <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Sparkles size={12} /> AI Improvement Tips
                </p>
                <ul className="space-y-2">
                  {analysis.ai_tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                      <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background: 'rgba(99,102,241,0.15)' }}>
                        <Star size={9} className="text-indigo-400" />
                      </div>
                      {tip}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* AI Summary */}
            {analysis.summary && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                className="rounded-2xl p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--bg-card-border)' }}>
                <p className="text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                  <TrendingUp size={11} /> AI Summary
                </p>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{analysis.summary}</p>
              </motion.div>
            )}
          </>
        )}
      </div>
      <AIAssistant />
    </AppLayout>
  );
};

export default Resume;
