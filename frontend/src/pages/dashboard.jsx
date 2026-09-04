import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, Zap, FolderGit2, Mic, ArrowRight,
  Sparkles, Target, Clock, CheckCircle, ChevronRight,
  AlertTriangle, BookOpen, GitBranch, FileText, Map, Dna,
  Briefcase, Loader2, Swords
} from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import AIAssistant from '../components/ai/AIAssistant';
import Tilt3DCard from '../components/Tilt3DCard';
import api from '../api';

// Animated counter
function AnimatedNumber({ value, suffix = '', duration = 1500 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let startTime;
    const step = (ts) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      setCount(Math.round(progress * value));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, value, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}

// Score ring
const ScoreRing = ({ score, size = 100, strokeWidth = 6, color = '#6366f1' }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const dash = (score / 100) * circumference;

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="var(--bg-secondary)" strokeWidth={strokeWidth} />
      <motion.circle
        cx={size/2} cy={size/2} r={radius} fill="none"
        stroke={color} strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: circumference - dash }}
        transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
        strokeLinecap="round"
        style={{ filter: `drop-shadow(0 0 6px ${color}60)` }}
      />
    </svg>
  );
};

// Stat card — with 3D tilt
const StatCard = ({ icon: Icon, label, value, suffix, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
  >
    <Tilt3DCard
      className="rounded-2xl p-5 border cursor-default relative overflow-hidden"
      style={{
        background: 'var(--bg-card)',
        borderColor: 'var(--bg-card-border)',
        boxShadow: 'var(--shadow-card)',
      }}
      maxTilt={8}
      scale={1.04}
    >
      {/* Gradient top edge */}
      <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: `linear-gradient(90deg, transparent, ${color}60, transparent)` }} />
      {/* Corner glow */}
      <div className="absolute top-0 right-0 w-16 h-16 rounded-full blur-2xl pointer-events-none" style={{ background: `${color}12` }} />
      <div className="flex items-center justify-between mb-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
          <Icon size={17} style={{ color, filter: `drop-shadow(0 0 4px ${color}80)` }} />
        </div>
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4], scale: [0.8, 1, 0.8] }}
          transition={{ duration: 2.5, repeat: Infinity }}
          className="w-2 h-2 rounded-full"
          style={{ background: color }}
        />
      </div>
      <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
        <AnimatedNumber value={parseInt(value) || 0} suffix={suffix} />
      </p>
      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
    </Tilt3DCard>
  </motion.div>
);

// Priority badge
const PriorityBadge = ({ priority }) => {
  const config = {
    high: { label: 'High', bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/25' },
    medium: { label: 'Medium', bg: 'bg-yellow-500/15', text: 'text-yellow-400', border: 'border-yellow-500/25' },
    low: { label: 'Low', bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/25' },
  };
  const c = config[priority] || config.low;
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${c.bg} ${c.text} ${c.border}`}>
      {c.label}
    </span>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [skillGaps, setSkillGaps] = useState([]);
  const [careerPaths, setCareerPaths] = useState([]);
  const [roadmapWeek1, setRoadmapWeek1] = useState([]);
  const [interviewResult, setInterviewResult] = useState(null);
  const [showStreakAnimation, setShowStreakAnimation] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setIsLoading(true);
    try {
      const profileRes = await api.get('/myprofile/');
      if (profileRes.data?.data) {
        const p = profileRes.data.data;
        setProfileData(p);

        // Use backend's streak_updated flag (authoritative source)
        if (profileRes.data.streak_updated) {
          setShowStreakAnimation(true);
          setTimeout(() => setShowStreakAnimation(false), 4000);
        }

        // Load from cached profile fields if available
        if (p.skill_gaps_data?.skill_gaps) {
          setSkillGaps(p.skill_gaps_data.skill_gaps.filter(g => g.priority === 'high').slice(0, 3));
        }
        if (p.career_dna_data?.career_paths) {
          setCareerPaths(p.career_dna_data.career_paths.slice(0, 3));
        }
        if (p.roadmap_data?.weeks?.[0]?.tasks) {
          setRoadmapWeek1(p.roadmap_data.weeks[0].tasks);
        }
      }
    } catch (e) { /* ignore */ }

    // Load last interview score separately
    try {
      const ivRes = await api.get('/interview/last/');
      if (ivRes.data?.data) setInterviewResult(ivRes.data.data);
    } catch (e) { /* no interview yet */ }

    setIsLoading(false);
  };

  const displayName = profileData?.user?.username || profileData?.username || 'there';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  // Compute stats from real data
  const topGap = skillGaps[0];
  const bestPath = careerPaths[0];
  const careerMatch = bestPath?.match_percentage || bestPath?.match || 0;
  const readinessScore = profileData?.readiness_score || careerMatch || 65;
  const realXP = profileData?.career_xp || 250;
  const realStreak = profileData?.streak || 1;
  const targetRole = profileData?.user_career_goals?.length
    ? profileData.user_career_goals[profileData.user_career_goals.length - 1].title
    : (bestPath?.role || 'Software Developer');
  const skillProgress = skillGaps.length > 0
    ? Math.round(skillGaps.reduce((s, g) => s + (g.current_level || g.current || 0) / (g.required_level || g.required || 10) * 100, 0) / skillGaps.length)
    : 0;
  const interviewScore = interviewResult?.score || 0;

  const quickLinks = [
    { label: 'Career DNA', icon: Dna, path: '/career-dna', color: '#6366f1', emoji: '🧬', desc: 'Analyze your strengths' },
    { label: 'Skill Gaps', icon: Zap, path: '/skill-gaps', color: '#8b5cf6', emoji: '⚡', desc: 'Find what to learn' },
    { label: 'Courses', icon: BookOpen, path: '/courses', color: '#3b82f6', emoji: '📚', desc: 'Curated learning paths' },
    { label: 'Jobs', icon: Briefcase, path: '/jobs', color: '#14b8a6', emoji: '💼', desc: 'Find matching jobs' },
    { label: 'Projects', icon: FolderGit2, path: '/projects', color: '#10b981', emoji: '🛠️', desc: 'Prove your skills' },
    { label: 'GitHub', icon: GitBranch, path: '/github', color: '#f59e0b', emoji: '🐙', desc: 'Code intelligence' },
    { label: 'Resume', icon: FileText, path: '/resume', color: '#ec4899', emoji: '📄', desc: 'AI resume analysis' },
    { label: 'Mock Interview', icon: Mic, path: '/mock-interview', color: '#f97316', emoji: '🎤', desc: 'Practice interviews' },
    { label: '1v1 Battle', icon: Swords, path: '/battle', color: '#ff4b4b', emoji: '⚔️', desc: 'Live coding match' },
  ];

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 size={28} className="animate-spin text-indigo-400" />
        </div>
        <AIAssistant />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">

        {/* Welcome header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'Space Grotesk, sans-serif' }}>
              {greeting}, {displayName} 👋
            </h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Here's your career progress today.</p>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl border"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--bg-card-border)' }}>
            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>All systems online</span>
          </div>
        </motion.div>

        {/* First Complete Profile Warning Banner */}
        {(!profileData?.skills?.length || !profileData?.user_career_goals?.length || !profileData?.user_educations?.length) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="text-orange-400" size={20} />
              </div>
              <div className="text-left">
                <h4 className="text-sm font-bold text-white">First, Complete Your Career Profile! ⚡</h4>
                <p className="text-xs text-[#9898b0] mt-0.5">Please add your skills, education, and target career goals on the profile page to unlock personalized AI roadmaps and skill gap diagnostics.</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/profile')}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 rounded-xl text-xs text-white font-bold transition-all shadow-md hover:shadow-orange-500/25 whitespace-nowrap"
            >
              Complete Profile <ArrowRight size={13} />
            </button>
          </motion.div>
        )}

        {/* Hero: Career Readiness */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="relative rounded-2xl p-6 overflow-hidden border"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--bg-card-border)', boxShadow: 'var(--shadow-card)' }}>
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-violet-500/5 pointer-events-none" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />
          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Score */}
            <div className="flex items-center gap-5">
              <div className="relative">
                <ScoreRing score={readinessScore} size={110} strokeWidth={7} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{readinessScore}</span>
                  <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>/ 100</span>
                </div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Career Readiness</p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                  <span className="text-sm font-semibold text-emerald-400">On Track</span>
                </div>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Based on your real profile & activity</p>
                <div className="mt-2 flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                  <Target size={12} />
                  <span>Target: <span className="text-indigo-400 font-medium">{targetRole}</span></span>
                </div>
              </div>
            </div>

            {/* AI Next Move */}
            <div className="md:col-span-2 bg-indigo-500/8 border border-indigo-500/20 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                  <Sparkles size={15} className="text-indigo-400" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-indigo-400 font-semibold uppercase tracking-wider mb-1">Your Next Best Move</p>
                  {topGap ? (
                    <>
                      <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                        Learn {topGap.name} — your #1 skill gap
                      </p>
                      <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>
                        {topGap.reason || `${topGap.name} is required in most ${bestPath?.role || 'Backend Developer'} job postings. Closing this gap will significantly boost your career readiness score.`}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                        Complete your Career DNA setup to get personalized guidance.
                      </p>
                      <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>
                        Tell us your skills and goals and our AI will create a custom learning path just for you.
                      </p>
                    </>
                  )}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => navigate(topGap ? '/courses' : '/career-dna')}
                      className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 rounded-lg text-[11px] text-white font-semibold transition-colors">
                      {topGap ? 'Start Learning' : 'Set Up Profile'} <ArrowRight size={11} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={TrendingUp} label="Career Match" value={careerMatch || 0} suffix="%" color="#6366f1" delay={0.15} />
          <StatCard icon={Zap} label="Career XP" value={realXP} suffix=" XP" color="#8b5cf6" delay={0.2} />
          <StatCard icon={FolderGit2} label={profileData?.github_username ? "GitHub Streak" : "Learning Streak"} value={realStreak} suffix=" Days 🔥" color="#14b8a6" delay={0.25} />
          <StatCard icon={Mic} label="Interview Score" value={interviewScore} suffix="%" color="#f59e0b" delay={0.3} />
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Skill Gaps */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="rounded-2xl p-5 border"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--bg-card-border)', boxShadow: 'var(--shadow-card)' }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Top Skill Gaps</h2>
              <button onClick={() => navigate('/skill-gaps')} className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                View all <ChevronRight size={12} />
              </button>
            </div>
            {skillGaps.length > 0 ? (
              <div className="space-y-4">
                {skillGaps.map((gap, i) => (
                  <motion.div key={gap.name || gap.id} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.1 }}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{gap.name}</span>
                      <PriorityBadge priority={gap.priority} />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${((gap.current_level || gap.current || 0) / (gap.required_level || gap.required || 10)) * 100}%` }}
                          transition={{ delay: 0.5 + i * 0.1, duration: 0.8, ease: 'easeOut' }}
                          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" />
                      </div>
                      <span className="text-[10px] whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>
                        {gap.current_level || gap.current || 0}/{gap.required_level || gap.required || 10}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Zap size={24} className="mx-auto mb-2 text-indigo-400 opacity-50" />
                <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>No skill gaps analyzed yet</p>
                <button onClick={() => navigate('/skill-gaps')}
                  className="text-xs text-indigo-400 hover:text-indigo-300 border border-indigo-500/30 px-3 py-1.5 rounded-lg transition-colors">
                  Run Analysis
                </button>
              </div>
            )}
            <button onClick={() => navigate('/skill-gaps')}
              className="w-full mt-5 py-2 text-xs border rounded-xl hover:border-indigo-500/30 hover:text-indigo-400 transition-all"
              style={{ color: 'var(--text-muted)', borderColor: 'var(--bg-card-border)' }}>
              View Full Skill Gap Analysis
            </button>
          </motion.div>

          {/* Roadmap preview */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            className="rounded-2xl p-5 border"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--bg-card-border)', boxShadow: 'var(--shadow-card)' }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>This Week's Tasks</h2>
              <button onClick={() => navigate('/roadmap')} className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                Full roadmap <ChevronRight size={12} />
              </button>
            </div>
            {roadmapWeek1.length > 0 ? (
              <div className="relative pl-5 space-y-4">
                <div className="absolute left-2 top-2 bottom-2 w-px" style={{ background: 'var(--bg-card-border)' }} />
                {roadmapWeek1.map((task, i) => (
                  <motion.div key={task.id || i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 + i * 0.1 }} className="relative">
                    <div className={`absolute -left-3 top-1 w-2 h-2 rounded-full border ${
                      task.status === 'in-progress' ? 'bg-indigo-500 border-indigo-400' :
                      task.status === 'done' ? 'bg-emerald-500 border-emerald-400' : ''
                    }`} style={task.status === 'pending' ? { background: 'var(--bg-secondary)', borderColor: 'var(--bg-card-border)' } : {}} />
                    <div className={`pl-3 py-1 ${task.status === 'in-progress' ? 'opacity-100' : 'opacity-70'}`}>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${
                          task.type === 'course' ? 'bg-blue-500/20 text-blue-400' :
                          task.type === 'build' ? 'bg-teal-500/20 text-teal-400' : 'bg-violet-500/20 text-violet-400'
                        }`}>{task.type}</span>
                        {task.status === 'in-progress' && <span className="text-[9px] text-indigo-400 font-medium">In Progress</span>}
                      </div>
                      <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{task.title}</p>
                      <p className="text-[10px] mt-0.5 flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                        <Clock size={9} />{task.duration}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Map size={24} className="mx-auto mb-2 text-indigo-400 opacity-50" />
                <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>No roadmap generated yet</p>
                <button onClick={() => navigate('/roadmap')}
                  className="text-xs text-indigo-400 hover:text-indigo-300 border border-indigo-500/30 px-3 py-1.5 rounded-lg transition-colors">
                  Generate Roadmap
                </button>
              </div>
            )}
            <button onClick={() => navigate('/roadmap')}
              className="w-full mt-5 py-2 text-xs border rounded-xl hover:border-indigo-500/30 hover:text-indigo-400 transition-all"
              style={{ color: 'var(--text-muted)', borderColor: 'var(--bg-card-border)' }}>
              Open Full Roadmap
            </button>
          </motion.div>

          {/* Career matches */}
          <div className="space-y-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="rounded-2xl p-5 border"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--bg-card-border)', boxShadow: 'var(--shadow-card)' }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Top Career Matches</h2>
                <button onClick={() => navigate('/career-dna')} className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                  Explore <ChevronRight size={12} />
                </button>
              </div>
              {careerPaths.length > 0 ? (
                <div className="space-y-2">
                  {careerPaths.map((path, i) => (
                    <motion.div key={path.role || i} initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.1 }}
                      className="flex items-center gap-3 p-2.5 rounded-xl border border-transparent hover:border-current transition-all cursor-pointer"
                      style={{ ['--tw-border-opacity']: 1 }}
                      onClick={() => navigate('/career-dna')}>
                      <span className="text-lg">{path.icon || '⚙️'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>{path.role}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
                            <div className="h-full rounded-full" style={{ width: `${path.match_percentage || path.match || 0}%`, backgroundColor: path.color || '#6366f1' }} />
                          </div>
                          <span className="text-[10px] font-bold" style={{ color: path.color || '#6366f1' }}>{path.match_percentage || path.match || 0}%</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>Run Career DNA to see matches</p>
                  <button onClick={() => navigate('/career-dna')}
                    className="text-xs text-indigo-400 border border-indigo-500/30 px-3 py-1.5 rounded-lg hover:bg-indigo-500/10 transition-all">
                    Analyze Now
                  </button>
                </div>
              )}
            </motion.div>

            {/* Last Interview */}
            {interviewResult && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                className="rounded-2xl p-5 border"
                style={{ background: 'var(--bg-card)', borderColor: 'var(--bg-card-border)', boxShadow: 'var(--shadow-card)' }}>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Last Interview</h2>
                  <button onClick={() => navigate('/mock-interview')} className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                    Practice <ChevronRight size={12} />
                  </button>
                </div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-2xl font-bold gradient-text">{interviewResult.score}%</div>
                  <div>
                    <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{interviewResult.target_role}</p>
                    <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{interviewResult.date}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { label: 'Technical', val: interviewResult.technical },
                    { label: 'Communication', val: interviewResult.communication },
                  ].map(s => (
                    <div key={s.label} className="p-2 rounded-lg" style={{ background: 'var(--bg-secondary)' }}>
                      <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
                      <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{s.val}%</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* AI Insight */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className="bg-gradient-to-r from-indigo-500/8 to-violet-500/8 border border-indigo-500/15 rounded-2xl p-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
            <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 4, repeat: Infinity }}>
              <Sparkles size={18} className="text-indigo-400" />
            </motion.div>
          </div>
          <div>
            <p className="text-xs text-indigo-400 font-semibold uppercase tracking-wider mb-1">AI Insight</p>
            <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
              {bestPath
                ? <>Based on your profile, <strong>{bestPath.role}</strong> is your strongest career path with a {bestPath.match_percentage || bestPath.match || 0}% match. {topGap ? <>Your biggest opportunity is learning <strong>{topGap.name}</strong> — it could make you job-ready significantly faster.</> : 'Keep building skills to boost your score.'}</>
                : 'Complete your Career DNA profile to get personalized AI insights about your best career path and next steps.'}
            </p>
          </div>
        </motion.div>

        {/* All Features Quick Links */}
        <div>
          <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>All Features</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {quickLinks.map((item, i) => (
              <motion.button key={item.path} onClick={() => navigate(item.path)}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 + i * 0.04 }}
                whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}
                className="p-3 rounded-2xl flex flex-col items-center gap-1.5 transition-all border"
                style={{ background: 'var(--bg-card)', borderColor: 'var(--bg-card-border)', boxShadow: 'var(--shadow-card)' }}>
                <span className="text-xl">{item.emoji}</span>
                <span className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                <span className="text-[9px] text-center leading-tight hidden sm:block" style={{ color: 'var(--text-muted)' }}>{item.desc}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>


      <AnimatePresence>
        {showStreakAnimation && (
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.7 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 60, scale: 0.7 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="fixed bottom-24 right-6 sm:bottom-10 sm:right-10 z-50 flex flex-col items-center gap-1"
          >
            {/* Floating fire emoji */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
              className="text-5xl"
            >🔥</motion.div>

            <div className="bg-gradient-to-r from-yellow-500 via-amber-400 to-orange-500 text-white px-6 py-3 rounded-2xl font-extrabold shadow-2xl shadow-yellow-500/50 flex items-center gap-3 border border-yellow-300/40" style={{ backdropFilter: 'blur(10px)' }}>
              <span className="text-2xl">✨</span>
              <div className="flex flex-col leading-tight">
                <span className="text-xs font-bold uppercase tracking-widest opacity-80">Daily Login Streak!</span>
                <span className="text-xl font-black">{realStreak} Day{realStreak !== 1 ? 's' : ''} 🔥</span>
              </div>
              <span className="text-2xl">✨</span>
            </div>
            <p className="text-xs text-yellow-300/70 font-semibold tracking-wide">Keep it up, {displayName}!</p>
          </motion.div>
        )}
      </AnimatePresence>

      <AIAssistant />
    </AppLayout>
  );
};

export default Dashboard;
