import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useInView, useMotionValue, useTransform, useSpring } from 'framer-motion';
import {
  User, Edit2, Save, X, Target, Trash2, Plus, Loader2,
  CheckCircle, AlertCircle, Zap, Star, GraduationCap,
  Briefcase, GitBranch, Sparkles, Trophy, Flame, BookOpen,
  CalendarDays, AtSign, Shield, TrendingUp
} from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import AIAssistant from '../components/ai/AIAssistant';
import api from '../api';
import { mockAchievements } from '../data/mockData';

/* ─────────────────────────────────────────────────────────────────────────────
   SKILL-COLOUR MAP — each skill category gets a unique colour
───────────────────────────────────────────────────────────────────────────── */
const SKILL_COLORS = [
  '#6366f1', '#a855f7', '#ec4899', '#f97316',
  '#10b981', '#14b8a6', '#3b82f6', '#f59e0b',
  '#ef4444', '#8b5cf6', '#22d3ee', '#84cc16',
];
const skillColor = (idx) => SKILL_COLORS[idx % SKILL_COLORS.length];

/* ─────────────────────────────────────────────────────────────────────────────
   TOAST
───────────────────────────────────────────────────────────────────────────── */
const Toast = ({ message, type }) => (
  <motion.div
    initial={{ opacity: 0, y: 48, scale: 0.88 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: 48, scale: 0.88 }}
    transition={{ type: 'spring', stiffness: 320, damping: 22 }}
    className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-3 px-5 py-3 rounded-2xl font-semibold text-sm shadow-2xl border"
    style={type === 'success' ? {
      background: 'rgba(16,185,129,0.15)',
      borderColor: 'rgba(16,185,129,0.4)',
      color: '#6ee7b7',
      boxShadow: '0 0 30px rgba(16,185,129,0.2)',
    } : {
      background: 'rgba(239,68,68,0.15)',
      borderColor: 'rgba(239,68,68,0.4)',
      color: '#fca5a5',
      boxShadow: '0 0 30px rgba(239,68,68,0.2)',
    }}
  >
    {type === 'success'
      ? <motion.div animate={{ rotate: [0, 20, -10, 0] }} transition={{ duration: 0.5 }}><CheckCircle size={16} /></motion.div>
      : <AlertCircle size={16} />
    }
    {message}
  </motion.div>
);

/* ─────────────────────────────────────────────────────────────────────────────
   ANIMATED RADIAL SCORE RING
───────────────────────────────────────────────────────────────────────────── */
const ScoreRing3D = ({ score, size = 130 }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const r = 46;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;

  return (
    <div ref={ref} className="relative" style={{ width: size, height: size }}>
      {/* Outer glow rings */}
      <motion.div
        animate={{ scale: [1, 1.06, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 3, repeat: Infinity }}
        className="absolute inset-[-6px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)' }}
      />
      <svg width={size} height={size} className="-rotate-90">
        {/* Track */}
        <circle cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke="rgba(99,102,241,0.1)" strokeWidth="8" />
        {/* Secondary ring */}
        <circle cx={size / 2} cy={size / 2} r={r - 10} fill="none"
          stroke="rgba(168,85,247,0.07)" strokeWidth="4" />
        {/* Main progress */}
        <motion.circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          stroke="url(#scoreGrad)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={inView ? { strokeDashoffset: circ - dash } : {}}
          transition={{ duration: 2, ease: 'easeOut', delay: 0.4 }}
          style={{ filter: 'drop-shadow(0 0 8px rgba(99,102,241,0.7))' }}
        />
        {/* Thin inner tick ring */}
        <motion.circle
          cx={size / 2} cy={size / 2} r={r - 10}
          fill="none"
          stroke="url(#scoreGrad2)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={2 * Math.PI * (r - 10)}
          initial={{ strokeDashoffset: 2 * Math.PI * (r - 10) }}
          animate={inView ? { strokeDashoffset: 2 * Math.PI * (r - 10) * (1 - score / 100) } : {}}
          transition={{ duration: 2.2, ease: 'easeOut', delay: 0.6 }}
          style={{ filter: 'drop-shadow(0 0 4px rgba(168,85,247,0.5))' }}
        />
        <defs>
          <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="50%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#14b8a6" />
          </linearGradient>
          <linearGradient id="scoreGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ec4899" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
      </svg>
      {/* Centre label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-3xl font-extrabold"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6, delay: 1, type: 'spring' }}
          style={{
            background: 'linear-gradient(135deg, #818cf8, #a78bfa)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {score}
        </motion.span>
        <span className="text-[10px] font-semibold tracking-widest" style={{ color: 'var(--text-muted)' }}>/ 100</span>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   ANIMATED SKILL CHIP
───────────────────────────────────────────────────────────────────────────── */
const SkillChip = ({ skill, index, onRemove }) => {
  const color = skillColor(index);
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.7, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.5, y: -8 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20, delay: index * 0.04 }}
      whileHover={{ scale: 1.08, y: -2 }}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold cursor-default border"
      style={{
        background: `${color}14`,
        borderColor: `${color}30`,
        color,
        boxShadow: `0 2px 8px ${color}18`,
      }}
    >
      <motion.span
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2.5, repeat: Infinity, delay: index * 0.2 }}
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ background: color }}
      />
      {skill.name}
      <button
        onClick={() => onRemove(skill.id, skill.name)}
        className="ml-0.5 hover:text-red-400 transition-colors rounded-full"
        style={{ color: `${color}99` }}
      >
        <X size={9} />
      </button>
    </motion.span>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   STAT CARD (small, right column)
───────────────────────────────────────────────────────────────────────────── */
const MiniStatCard = ({ icon: Icon, label, value, color, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay, duration: 0.5, type: 'spring' }}
  >
    <div
      className="p-4 rounded-2xl border relative overflow-hidden"
      style={{ background: 'var(--bg-card)', borderColor: 'var(--bg-card-border)' }}
    >
      {/* Gradient top bar */}
      <div className="absolute top-0 left-0 right-0 h-0.5"
        style={{ background: `linear-gradient(90deg, transparent, ${color}60, transparent)` }} />
      {/* Corner glow */}
      <div className="absolute top-0 right-0 w-12 h-12 rounded-full blur-xl pointer-events-none"
        style={{ background: `${color}18` }} />
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wider mb-0.5" style={{ color: 'var(--text-muted)' }}>{label}</p>
          <p className="text-base font-extrabold" style={{ color }}>{value}</p>
        </div>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
          <Icon size={16} style={{ color, filter: `drop-shadow(0 0 4px ${color}80)` }} />
        </div>
      </div>
    </div>
  </motion.div>
);

/* ─────────────────────────────────────────────────────────────────────────────
   SECTION CARD WRAPPER
───────────────────────────────────────────────────────────────────────────── */
const SectionCard = ({ title, icon: Icon, iconColor = '#6366f1', children, delay = 0, action }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5, type: 'spring', stiffness: 100 }}
  >
    <div
      className="rounded-2xl border overflow-hidden"
      style={{ background: 'var(--bg-card)', borderColor: 'var(--bg-card-border)' }}
    >
      {/* Top gradient accent */}
      <div className="h-0.5 w-full"
        style={{ background: `linear-gradient(90deg, ${iconColor}40, ${iconColor}80, transparent)` }} />
      <div className="p-5">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: `${iconColor}15`, border: `1px solid ${iconColor}25` }}>
              <Icon size={15} style={{ color: iconColor, filter: `drop-shadow(0 0 4px ${iconColor}80)` }} />
            </div>
            <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{title}</h3>
          </div>
          {action}
        </div>
        {children}
      </div>
    </div>
  </motion.div>
);

/* ─────────────────────────────────────────────────────────────────────────────
   INPUT FIELD (shared style)
───────────────────────────────────────────────────────────────────────────── */
const Field = ({ label, children }) => (
  <div>
    <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>
      {label}
    </label>
    {children}
  </div>
);
const inputCls = "w-full rounded-xl px-3 py-2 text-xs transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/30 resize-none";
const inputStyle = {
  background: 'var(--bg-input)',
  border: '1px solid var(--bg-card-border)',
  color: 'var(--text-primary)',
};
const onFocusIn = e => (e.target.style.borderColor = 'rgba(99,102,241,0.5)');
const onFocusOut = e => (e.target.style.borderColor = 'var(--bg-card-border)');

/* ─────────────────────────────────────────────────────────────────────────────
   ADD / CANCEL BUTTONS
───────────────────────────────────────────────────────────────────────────── */
const FormActions = ({ onCancel, saving, saveLabel = 'Save' }) => (
  <div className="flex justify-end gap-2 pt-1">
    <button type="button" onClick={onCancel}
      className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border hover:bg-white/5"
      style={{ borderColor: 'var(--bg-card-border)', color: 'var(--text-secondary)' }}
    >
      Cancel
    </button>
    <motion.button
      type="submit" disabled={saving}
      whileHover={!saving ? { scale: 1.03, boxShadow: '0 0 20px rgba(99,102,241,0.4)' } : {}}
      whileTap={!saving ? { scale: 0.97 } : {}}
      className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold text-white disabled:opacity-50 transition-all"
      style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}
    >
      {saving ? <><Loader2 size={11} className="animate-spin" /> Saving…</> : <><Plus size={11} /> {saveLabel}</>}
    </motion.button>
  </div>
);

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN PROFILE PAGE
═══════════════════════════════════════════════════════════════════════════ */
const Profile = () => {
  const [profileData, setProfileData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({ experience: '', bio: '' });
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [toast, setToast] = useState(null);
  const [newSkill, setNewSkill] = useState('');
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [isAddingEdu, setIsAddingEdu] = useState(false);
  const [isSavingEdu, setIsSavingEdu] = useState(false);
  const [deletingEduId, setDeletingEduId] = useState(null);
  const [eduForm, setEduForm] = useState({ course: '', institution: '', start_date: '', end_date: '' });
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [isSavingGoal, setIsSavingGoal] = useState(false);
  const [deletingGoalId, setDeletingGoalId] = useState(null);
  const [goalForm, setGoalForm] = useState({ title: '', description: '', target_date: '' });

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = () => {
    setLoading(true);
    api.get('/myprofile/')
      .then(res => {
        if (res.data?.data) {
          const p = res.data.data;
          setProfileData(p);
          setForm({ experience: p.experience || '', bio: p.bio || '' });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const handleSave = async () => {
    setSavingProfile(true);
    try {
      if (profileData?.id) {
        await api.patch(`/updateprofile/${profileData.id}/`, form);
        setProfileData(prev => ({ ...prev, ...form }));
        setIsEditing(false);
        showToast('Profile updated!', 'success');
      }
    } catch { showToast('Failed to save profile', 'error'); }
    finally { setSavingProfile(false); }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    const skillName = newSkill.trim();
    if (!skillName) return;
    setIsAddingSkill(true);
    try {
      const res = await api.post('/addskills/', { name: skillName });
      if (res.data?.data) {
        setProfileData(prev => ({ ...prev, skills: [...(prev.skills || []), res.data.data] }));
        setNewSkill('');
        showToast(`"${skillName}" added!`, 'success');
      }
    } catch { showToast('Failed to add skill', 'error'); }
    finally { setIsAddingSkill(false); }
  };

  const handleRemoveSkill = async (skillId, skillName) => {
    try {
      await api.delete(`/removeskill/${skillId}/`);
      setProfileData(prev => ({ ...prev, skills: (prev.skills || []).filter(s => s.id !== skillId) }));
      showToast(`"${skillName}" removed`, 'success');
    } catch { showToast('Failed to remove skill', 'error'); }
  };

  const handleAddEdu = async (e) => {
    e.preventDefault();
    if (!eduForm.course.trim() || !eduForm.institution.trim() || !eduForm.start_date) {
      showToast('Please fill Course, Institution, and Start Date', 'error'); return;
    }
    setIsSavingEdu(true);
    try {
      const res = await api.post('/addeducation/', {
        course: eduForm.course.trim(),
        institution: eduForm.institution.trim(),
        start_date: eduForm.start_date,
        end_date: eduForm.end_date || null,
      });
      if (res.data?.status === 'success' && res.data?.data) {
        setProfileData(prev => ({ ...prev, user_educations: [...(prev.user_educations || []), res.data.data] }));
        setEduForm({ course: '', institution: '', start_date: '', end_date: '' });
        setIsAddingEdu(false);
        showToast('Education saved!', 'success');
      } else { showToast('Could not save education', 'error'); }
    } catch { showToast('Error saving education', 'error'); }
    finally { setIsSavingEdu(false); }
  };

  const handleDeleteEdu = async (eduId) => {
    setDeletingEduId(eduId);
    try {
      await api.delete(`/education/${eduId}/`);
      setProfileData(prev => ({ ...prev, user_educations: (prev.user_educations || []).filter(e => e.id !== eduId) }));
      showToast('Education removed', 'success');
    } catch { showToast('Failed to delete education', 'error'); }
    finally { setDeletingEduId(null); }
  };

  const handleAddGoal = async (e) => {
    e.preventDefault();
    if (!goalForm.title.trim() || !goalForm.description.trim()) {
      showToast('Please fill Role Title and Description', 'error'); return;
    }
    setIsSavingGoal(true);
    try {
      const res = await api.post('/addcarrergoal/', {
        title: goalForm.title.trim(),
        description: goalForm.description.trim(),
        target_date: goalForm.target_date || null,
      });
      if (res.data?.data) {
        setProfileData(prev => ({ ...prev, user_career_goals: [...(prev.user_career_goals || []), res.data.data] }));
        setGoalForm({ title: '', description: '', target_date: '' });
        setIsAddingGoal(false);
        showToast('Career goal added!', 'success');
      }
    } catch { showToast('Failed to add career goal', 'error'); }
    finally { setIsSavingGoal(false); }
  };

  const handleDeleteGoal = async (goalId) => {
    setDeletingGoalId(goalId);
    try {
      await api.delete(`/careergoal/${goalId}/`);
      setProfileData(prev => ({ ...prev, user_career_goals: (prev.user_career_goals || []).filter(g => g.id !== goalId) }));
      showToast('Goal removed', 'success');
    } catch { showToast('Failed to delete goal', 'error'); }
    finally { setDeletingGoalId(null); }
  };

  const displayName = profileData?.user?.username || 'there';
  const initial = displayName?.[0]?.toUpperCase() || 'U';
  const targetRole = profileData?.user_career_goals?.length
    ? profileData.user_career_goals[profileData.user_career_goals.length - 1].title
    : 'Software Developer';

  /* ── Loading screen ── */
  if (loading) {
    return (
      <AppLayout title="Profile" subtitle="Your career profile">
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
            className="w-10 h-10 rounded-full border-2 border-transparent"
            style={{ borderTopColor: '#6366f1', borderRightColor: '#a855f7' }}
          />
          <motion.p
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-xs" style={{ color: 'var(--text-muted)' }}
          >
            Loading your profile…
          </motion.p>
        </div>
        <AIAssistant />
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Profile" subtitle="Your career profile">
      <div className="p-5 max-w-5xl mx-auto space-y-5">

        {/* ════════════════════════════════════════════════════
            HERO HEADER CARD — 3D perspective banner
        ════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, type: 'spring', stiffness: 80 }}
          className="relative rounded-3xl overflow-hidden"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--bg-card-border)' }}
        >
          {/* Animated gradient banner behind avatar */}
          <div className="absolute top-0 left-0 right-0 h-28 overflow-hidden">
            <motion.div
              animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 20%, #ec4899 40%, #f97316 60%, #14b8a6 80%, #4f46e5 100%)',
                backgroundSize: '300% 300%',
                opacity: 0.18,
              }}
            />
            {/* Subtle grid overlay */}
            <div className="absolute inset-0 bg-grid opacity-30" />
            {/* Shimmer scan line */}
            <motion.div
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', repeatDelay: 2 }}
              className="absolute top-0 bottom-0 w-1/3 pointer-events-none"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)' }}
            />
          </div>

          {/* Floating orbs */}
          <motion.div
            animate={{ x: ['-5%', '5%', '-5%'], y: ['-5%', '5%', '-5%'], scale: [1, 1.1, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-[-20px] right-[-20px] w-40 h-40 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)' }}
          />
          <motion.div
            animate={{ x: ['5%', '-5%', '5%'], y: ['5%', '-5%', '5%'] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-4 left-1/3 w-24 h-24 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.12) 0%, transparent 70%)' }}
          />

          <div className="relative px-6 pb-6 pt-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">

              {/* Avatar — 3D perspective tilt on hover */}
              <motion.div
                whileHover={{ rotateY: 15, rotateX: -8, scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                style={{ transformStyle: 'preserve-3d', perspective: '600px', transformOrigin: 'center' }}
                className="relative flex-shrink-0"
              >
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-extrabold text-white"
                  style={{
                    background: 'linear-gradient(135deg, #4f46e5, #a855f7, #ec4899)',
                    boxShadow: '0 0 0 3px rgba(99,102,241,0.3), 0 8px 30px rgba(99,102,241,0.4)',
                  }}
                >
                  {initial}
                </div>
                {/* Online dot */}
                <motion.div
                  animate={{ scale: [1, 1.3, 1], opacity: [0.8, 1, 0.8] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 bg-emerald-400"
                  style={{ borderColor: 'var(--bg-card)', boxShadow: '0 0 8px rgba(52,211,153,0.7)' }}
                />
                {/* Sparkle orbiting */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                  className="absolute -inset-2 rounded-2xl pointer-events-none"
                  style={{ border: '1px dashed rgba(99,102,241,0.2)' }}
                />
              </motion.div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <motion.h1
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="text-xl font-extrabold mb-0.5"
                  style={{ color: 'var(--text-primary)', fontFamily: 'Space Grotesk, sans-serif' }}
                >
                  {displayName}
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-xs flex items-center gap-1.5 mb-3"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <AtSign size={11} />
                  {profileData?.user?.email || 'No email added'}
                </motion.p>

                {/* Badges row */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-wrap gap-2"
                >
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[11px] font-semibold"
                    style={{ background: 'rgba(99,102,241,0.12)', borderColor: 'rgba(99,102,241,0.3)', color: '#818cf8' }}>
                    <Target size={10} /> {targetRole}
                  </span>
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[11px] font-semibold"
                    style={{ background: 'rgba(245,158,11,0.12)', borderColor: 'rgba(245,158,11,0.3)', color: '#fbbf24' }}>
                    <Flame size={10} /> {profileData?.streak || 1} day streak
                  </span>
                  {profileData?.github_username && (
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[11px] font-semibold"
                      style={{ background: 'rgba(16,185,129,0.12)', borderColor: 'rgba(16,185,129,0.3)', color: '#34d399' }}>
                      <GitBranch size={10} /> @{profileData.github_username}
                    </span>
                  )}
                </motion.div>
              </div>

              {/* Edit button */}
              <motion.button
                onClick={() => setIsEditing(!isEditing)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all flex-shrink-0"
                style={isEditing
                  ? { background: 'rgba(239,68,68,0.12)', borderColor: 'rgba(239,68,68,0.3)', color: '#f87171' }
                  : { background: 'var(--bg-secondary)', borderColor: 'var(--bg-card-border)', color: 'var(--text-secondary)' }
                }
              >
                {isEditing ? <><X size={13} /> Cancel</> : <><Edit2 size={13} /> Edit Profile</>}
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* ════════════════════════════════════════════════════
            MAIN GRID
        ════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* ── LEFT (2/3) ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* About Me */}
            <SectionCard title="About Me" icon={User} iconColor="#6366f1" delay={0.1}
              action={
                isEditing && (
                  <motion.button
                    onClick={handleSave} disabled={savingProfile}
                    whileHover={!savingProfile ? { scale: 1.05, boxShadow: '0 0 18px rgba(99,102,241,0.4)' } : {}}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white disabled:opacity-50 transition-all"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}
                  >
                    {savingProfile ? <><Loader2 size={11} className="animate-spin" /> Saving…</> : <><Save size={11} /> Save</>}
                  </motion.button>
                )
              }
            >
              <AnimatePresence mode="wait">
                {isEditing ? (
                  <motion.div key="editing" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-3">
                    <Field label="Experience">
                      <input type="text" value={form.experience}
                        onChange={e => setForm(p => ({ ...p, experience: e.target.value }))}
                        placeholder="e.g. 2 years Frontend Development"
                        className={inputCls} style={inputStyle}
                        onFocus={onFocusIn} onBlur={onFocusOut}
                      />
                    </Field>
                    <Field label="Bio">
                      <textarea value={form.bio} rows={4}
                        onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
                        placeholder="Write a brief bio about yourself…"
                        className={inputCls} style={inputStyle}
                        onFocus={onFocusIn} onBlur={onFocusOut}
                      />
                    </Field>
                  </motion.div>
                ) : (
                  <motion.div key="viewing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    <div className="p-3 rounded-xl border" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--bg-card-border)' }}>
                      <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>Experience</p>
                      <p className="text-sm leading-relaxed" style={{ color: profileData?.experience ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                        {profileData?.experience || 'No experience added yet — click Edit Profile to add.'}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl border" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--bg-card-border)' }}>
                      <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>Bio</p>
                      <p className="text-sm leading-relaxed" style={{ color: profileData?.bio ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                        {profileData?.bio || 'No bio yet — tell the world who you are.'}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </SectionCard>

            {/* Education */}
            <SectionCard title="Education" icon={GraduationCap} iconColor="#3b82f6" delay={0.15}>
              <div className="space-y-3 mb-3">
                <AnimatePresence>
                  {profileData?.user_educations?.length ? (
                    profileData.user_educations.map((edu, i) => (
                      <motion.div
                        key={edu.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20, height: 0 }}
                        transition={{ delay: i * 0.06, type: 'spring' }}
                        className="group flex items-start gap-3 p-3 rounded-xl border"
                        style={{ background: 'var(--bg-secondary)', borderColor: 'var(--bg-card-border)' }}
                      >
                        {/* Timeline dot */}
                        <div className="mt-1 flex-shrink-0">
                          <motion.div
                            animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
                            transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)', boxShadow: '0 0 6px rgba(59,130,246,0.7)' }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{edu.course}</p>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{edu.institution}</p>
                          <p className="text-[10px] mt-0.5 flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                            <CalendarDays size={9} /> {edu.start_date} — {edu.end_date || 'Present'}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteEdu(edu.id)}
                          disabled={deletingEduId === edu.id}
                          className="opacity-0 group-hover:opacity-100 transition-all rounded-lg p-1 hover:bg-red-500/10 flex-shrink-0"
                          style={{ color: 'var(--text-muted)' }}
                          onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
                          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                        >
                          {deletingEduId === edu.id
                            ? <Loader2 size={12} className="animate-spin text-red-400" />
                            : <Trash2 size={12} />}
                        </button>
                      </motion.div>
                    ))
                  ) : (
                    !isAddingEdu && (
                      <p className="text-xs italic" style={{ color: 'var(--text-muted)' }}>No education added yet.</p>
                    )
                  )}
                </AnimatePresence>
              </div>

              <AnimatePresence>
                {isAddingEdu && (
                  <motion.form
                    initial={{ opacity: 0, y: -12, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -12, scale: 0.97 }}
                    onSubmit={handleAddEdu}
                    className="space-y-3 p-4 rounded-xl border mb-3"
                    style={{ background: 'rgba(59,130,246,0.05)', borderColor: 'rgba(59,130,246,0.25)' }}
                  >
                    <Field label="Course / Degree *">
                      <input type="text" required value={eduForm.course}
                        onChange={e => setEduForm(p => ({ ...p, course: e.target.value }))}
                        placeholder="B.Tech Computer Science"
                        className={inputCls} style={inputStyle}
                        onFocus={onFocusIn} onBlur={onFocusOut}
                      />
                    </Field>
                    <Field label="Institution *">
                      <input type="text" required value={eduForm.institution}
                        onChange={e => setEduForm(p => ({ ...p, institution: e.target.value }))}
                        placeholder="IIT Delhi"
                        className={inputCls} style={inputStyle}
                        onFocus={onFocusIn} onBlur={onFocusOut}
                      />
                    </Field>
                    <div className="grid grid-cols-2 gap-2">
                      <Field label="Start Date *">
                        <input type="date" required value={eduForm.start_date}
                          onChange={e => setEduForm(p => ({ ...p, start_date: e.target.value }))}
                          className={inputCls} style={inputStyle}
                          onFocus={onFocusIn} onBlur={onFocusOut}
                        />
                      </Field>
                      <Field label="End Date (optional)">
                        <input type="date" value={eduForm.end_date}
                          onChange={e => setEduForm(p => ({ ...p, end_date: e.target.value }))}
                          className={inputCls} style={inputStyle}
                          onFocus={onFocusIn} onBlur={onFocusOut}
                        />
                      </Field>
                    </div>
                    <FormActions
                      onCancel={() => { setIsAddingEdu(false); setEduForm({ course: '', institution: '', start_date: '', end_date: '' }); }}
                      saving={isSavingEdu} saveLabel="Save Education"
                    />
                  </motion.form>
                )}
              </AnimatePresence>

              {!isAddingEdu && (
                <motion.button
                  onClick={() => setIsAddingEdu(true)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold border border-dashed transition-all"
                  style={{ borderColor: 'rgba(59,130,246,0.3)', color: 'var(--text-muted)' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(59,130,246,0.6)'; e.currentTarget.style.color = '#60a5fa'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(59,130,246,0.3)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                >
                  <Plus size={12} /> Add Education
                </motion.button>
              )}
            </SectionCard>

            {/* Career Goals */}
            <SectionCard title="Career Goals" icon={Target} iconColor="#a855f7" delay={0.2}>
              <div className="space-y-3 mb-3">
                <AnimatePresence>
                  {profileData?.user_career_goals?.length ? (
                    profileData.user_career_goals.map((goal, i) => (
                      <motion.div
                        key={goal.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20, height: 0 }}
                        transition={{ delay: i * 0.06, type: 'spring' }}
                        className="group p-3 rounded-xl border relative overflow-hidden"
                        style={{ background: 'var(--bg-secondary)', borderColor: 'var(--bg-card-border)' }}
                      >
                        {/* Left glow bar */}
                        <div className="absolute left-0 top-0 bottom-0 w-0.5"
                          style={{ background: 'linear-gradient(180deg, #a855f7, #ec4899)' }} />
                        <div className="pl-3 flex justify-between items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <p className="text-xs font-bold truncate" style={{ color: 'var(--text-primary)' }}>{goal.title}</p>
                              {goal.target_date && (
                                <span className="flex-shrink-0 text-[9px] px-1.5 py-0.5 rounded-full font-semibold"
                                  style={{ background: 'rgba(20,184,166,0.12)', color: '#2dd4bf' }}>
                                  {goal.target_date}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{goal.description}</p>
                          </div>
                          <button
                            onClick={() => handleDeleteGoal(goal.id)}
                            disabled={deletingGoalId === goal.id}
                            className="opacity-0 group-hover:opacity-100 transition-all rounded-lg p-1 hover:bg-red-500/10 flex-shrink-0"
                            style={{ color: 'var(--text-muted)' }}
                            onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
                            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                          >
                            {deletingGoalId === goal.id
                              ? <Loader2 size={12} className="animate-spin text-red-400" />
                              : <Trash2 size={12} />}
                          </button>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    !isAddingGoal && (
                      <p className="text-xs italic" style={{ color: 'var(--text-muted)' }}>No career goals added yet.</p>
                    )
                  )}
                </AnimatePresence>
              </div>

              <AnimatePresence>
                {isAddingGoal && (
                  <motion.form
                    initial={{ opacity: 0, y: -12, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -12, scale: 0.97 }}
                    onSubmit={handleAddGoal}
                    className="space-y-3 p-4 rounded-xl border mb-3"
                    style={{ background: 'rgba(168,85,247,0.05)', borderColor: 'rgba(168,85,247,0.25)' }}
                  >
                    <Field label="Target Role / Goal Title *">
                      <input type="text" required value={goalForm.title}
                        onChange={e => setGoalForm(p => ({ ...p, title: e.target.value }))}
                        placeholder="Backend Developer"
                        className={inputCls} style={inputStyle}
                        onFocus={onFocusIn} onBlur={onFocusOut}
                      />
                    </Field>
                    <Field label="Description *">
                      <textarea required value={goalForm.description} rows={2}
                        onChange={e => setGoalForm(p => ({ ...p, description: e.target.value }))}
                        placeholder="Master Django, PostgreSQL and Docker…"
                        className={inputCls} style={inputStyle}
                        onFocus={onFocusIn} onBlur={onFocusOut}
                      />
                    </Field>
                    <Field label="Target Date (optional)">
                      <input type="date" value={goalForm.target_date}
                        onChange={e => setGoalForm(p => ({ ...p, target_date: e.target.value }))}
                        className={inputCls} style={inputStyle}
                        onFocus={onFocusIn} onBlur={onFocusOut}
                      />
                    </Field>
                    <FormActions
                      onCancel={() => { setIsAddingGoal(false); setGoalForm({ title: '', description: '', target_date: '' }); }}
                      saving={isSavingGoal} saveLabel="Save Goal"
                    />
                  </motion.form>
                )}
              </AnimatePresence>

              {!isAddingGoal && (
                <motion.button
                  onClick={() => setIsAddingGoal(true)}
                  whileHover={{ scale: 1.01 }}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold border border-dashed transition-all"
                  style={{ borderColor: 'rgba(168,85,247,0.3)', color: 'var(--text-muted)' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(168,85,247,0.6)'; e.currentTarget.style.color = '#c084fc'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(168,85,247,0.3)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                >
                  <Plus size={12} /> Add Career Goal
                </motion.button>
              )}
            </SectionCard>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="space-y-5">

            {/* Career Readiness Ring */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15, type: 'spring', stiffness: 100 }}
            >
              <div
                className="rounded-2xl border p-5 text-center relative overflow-hidden"
                style={{ background: 'var(--bg-card)', borderColor: 'var(--bg-card-border)' }}
              >
                {/* Gradient top */}
                <div className="absolute top-0 left-0 right-0 h-0.5"
                  style={{ background: 'linear-gradient(90deg, #6366f1, #a855f7, #14b8a6)' }} />
                <div className="absolute inset-0 pointer-events-none"
                  style={{ background: 'radial-gradient(ellipse at top, rgba(99,102,241,0.06) 0%, transparent 60%)' }} />
                <div className="relative">
                  <p className="text-xs font-bold uppercase tracking-widest mb-4"
                    style={{ color: 'var(--text-muted)' }}>Career Readiness</p>
                  <div className="flex justify-center mb-3">
                    <ScoreRing3D score={profileData?.readiness_score || 50} size={130} />
                  </div>
                  <motion.p
                    animate={{ opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="text-[11px] font-semibold"
                    style={{ color: '#10b981' }}
                  >
                    ● On Track
                  </motion.p>
                </div>
              </div>
            </motion.div>

            {/* Mini stat cards */}
            <div className="grid grid-cols-2 gap-3">
              <MiniStatCard icon={Zap} label="Career XP" value={`${(profileData?.career_xp || 250).toLocaleString()}`} color="#a855f7" delay={0.2} />
              <MiniStatCard icon={Flame} label="Streak" value={`${profileData?.streak || 1}d 🔥`} color="#f97316" delay={0.25} />
              <MiniStatCard icon={BookOpen} label="Skills" value={`${(profileData?.skills || []).length}`} color="#3b82f6" delay={0.3} />
              <MiniStatCard icon={Target} label="Goals" value={`${(profileData?.user_career_goals || []).length}`} color="#ec4899" delay={0.35} />
            </div>

            {/* Skills section */}
            <SectionCard title="Skills" icon={Zap} iconColor="#f59e0b" delay={0.2}>
              <div className="flex flex-wrap gap-2 mb-4 min-h-[40px]">
                <AnimatePresence>
                  {(profileData?.skills || []).length > 0 ? (
                    (profileData.skills).map((skill, i) => (
                      <SkillChip
                        key={skill.id || i}
                        skill={skill}
                        index={i}
                        onRemove={handleRemoveSkill}
                      />
                    ))
                  ) : (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-xs italic"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      No skills yet — add your first one below!
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
              <form onSubmit={handleAddSkill} className="flex gap-2">
                <input
                  type="text" required value={newSkill}
                  onChange={e => setNewSkill(e.target.value)}
                  placeholder="e.g. React, Docker…"
                  className="flex-1 rounded-xl px-3 py-2 text-xs transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  style={inputStyle}
                  onFocus={onFocusIn} onBlur={onFocusOut}
                />
                <motion.button
                  type="submit" disabled={isAddingSkill}
                  whileHover={!isAddingSkill ? { scale: 1.08, boxShadow: '0 0 16px rgba(245,158,11,0.4)' } : {}}
                  whileTap={{ scale: 0.93 }}
                  className="px-3 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-1 disabled:opacity-50 transition-all"
                  style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)' }}
                >
                  {isAddingSkill ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
                </motion.button>
              </form>
            </SectionCard>

            {/* Achievements */}
            <SectionCard title="Achievements" icon={Trophy} iconColor="#f59e0b" delay={0.3}>
              <div className="grid grid-cols-3 gap-2">
                {mockAchievements.map((a, i) => (
                  <motion.div
                    key={a.id}
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + i * 0.04, type: 'spring' }}
                    whileHover={a.earned ? { scale: 1.1, y: -3, boxShadow: '0 8px 20px rgba(245,158,11,0.2)' } : {}}
                    className="flex flex-col items-center gap-1 p-2.5 rounded-xl border transition-all"
                    style={a.earned ? {
                      background: 'rgba(245,158,11,0.08)',
                      borderColor: 'rgba(245,158,11,0.25)',
                    } : {
                      background: 'var(--bg-secondary)',
                      borderColor: 'var(--bg-card-border)',
                      opacity: 0.4,
                    }}
                  >
                    <motion.span
                      className="text-xl"
                      animate={a.earned ? { y: [0, -2, 0] } : {}}
                      transition={{ duration: 2, repeat: Infinity, delay: i * 0.3, ease: 'easeInOut' }}
                    >
                      {a.icon}
                    </motion.span>
                    <p className="text-[8px] text-center leading-tight font-medium" style={{ color: a.earned ? '#fbbf24' : 'var(--text-muted)' }}>
                      {a.title}
                    </p>
                  </motion.div>
                ))}
              </div>
            </SectionCard>
          </div>
        </div>
      </div>

      {/* ── Toast ── */}
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} />}
      </AnimatePresence>

      <AIAssistant />
    </AppLayout>
  );
};

export default Profile;
