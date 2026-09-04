import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GitBranch, ExternalLink, Star, TrendingUp, Check, AlertTriangle, RefreshCw, Loader2, X, Sparkles, Code2 } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import AIAssistant from '../components/ai/AIAssistant';
import Tilt3DCard from '../components/Tilt3DCard';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const MetricCard = ({ metric, index }) => (
  <Tilt3DCard maxTilt={7} scale={1.03}
    className="rounded-2xl p-4 cursor-default"
    style={{ background: 'var(--bg-card)', border: '1px solid var(--bg-card-border)' }}>
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{metric.label}</p>
        <span className="text-sm font-bold gradient-text">{metric.score}</span>
      </div>
      <div className="h-2 rounded-full overflow-hidden mb-2" style={{ background: 'var(--bg-primary)' }}>
        <motion.div initial={{ width: 0 }} animate={{ width: `${metric.score}%` }}
          transition={{ delay: 0.3 + index * 0.1, duration: 0.8, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ background: 'linear-gradient(90deg, #6366f1, #8b5cf6)', boxShadow: '0 0 6px rgba(99,102,241,0.5)' }} />
      </div>
      <p className="text-[10px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>{metric.description}</p>
    </motion.div>
  </Tilt3DCard>
);

const GitHubPage = () => {
  const { refreshUserProfile } = useAuth();
  const [profile, setProfile] = useState(null);
  const [githubData, setGithubData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [inputUsername, setInputUsername] = useState('');
  const [error, setError] = useState('');
  const [saveMsg, setSaveMsg] = useState('');

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await api.get('/myprofile/');
      const prof = res.data?.data;
      setProfile(prof);
      if (prof?.github_username) {
        setInputUsername(prof.github_username);
        if (prof.github_data) setGithubData(prof.github_data);
        else await fetchGitHubAnalysis(false);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchGitHubAnalysis = async (force = false) => {
    setAnalyzing(true); setLoadingStep('Fetching GitHub profile data...'); setError('');
    try {
      const url = force ? '/github/analyze/?force=true' : '/github/analyze/';
      const res = await api.get(url);
      if (res.data?.data) { setGithubData(res.data.data); setLoadingStep(''); }
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to fetch GitHub data'); setLoadingStep('');
    } finally { setAnalyzing(false); }
  };

  const handleConnect = async (e) => {
    e.preventDefault();
    const username = inputUsername.trim().replace('@', '').replace('https://github.com/', '');
    if (!username) return;
    setError(''); setAnalyzing(true);
    try {
      setLoadingStep('Saving GitHub username...');
      await api.post('/github/link/', { username });
      setLoadingStep('Analyzing your GitHub profile with AI...');
      const res = await api.get('/github/analyze/');
      if (res.data?.data) {
        setGithubData(res.data.data);
        const updatedProf = await refreshUserProfile();
        setProfile(updatedProf);
        setSaveMsg('GitHub connected successfully!');
        setTimeout(() => setSaveMsg(''), 4000);
      }
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to connect GitHub. Check the username and try again.');
    } finally { setAnalyzing(false); setLoadingStep(''); }
  };

  const handleDisconnect = async () => {
    try {
      await api.delete('/github/unlink/');
      setGithubData(null);
      setProfile(prev => ({ ...prev, github_username: null, github_data: null }));
      setInputUsername('');
      await refreshUserProfile();
      setSaveMsg('GitHub disconnected.');
      setTimeout(() => setSaveMsg(''), 3000);
    } catch (e) { setError('Failed to disconnect'); }
  };

  if (loading) {
    return (
      <AppLayout title="GitHub Intelligence" subtitle="Turn your code into career evidence">
        <div className="flex items-center justify-center min-h-[60vh] gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading GitHub data...</span>
        </div>
        <AIAssistant />
      </AppLayout>
    );
  }

  const isConnected = !!profile?.github_username;

  if (!isConnected || !githubData) {
    return (
      <AppLayout title="GitHub Intelligence" subtitle="Turn your code into career evidence">
        <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
          {/* Hero icon */}
          <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6"
            style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.15))', border: '1px solid rgba(99,102,241,0.3)', boxShadow: '0 0 30px rgba(99,102,241,0.2)' }}>
            <GitBranch size={36} className="text-indigo-400" />
          </motion.div>

          <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            Connect Your GitHub
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="text-sm text-center max-w-sm mb-6" style={{ color: 'var(--text-muted)' }}>
            Connect GitHub to turn your coding activity into career evidence that employers can see.
          </motion.p>

          {analyzing ? (
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-3 px-6 py-3 rounded-xl"
                style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.22)' }}>
                <Loader2 size={16} className="animate-spin text-indigo-400" />
                <span className="text-sm font-medium" style={{ color: '#a5b4fc' }}>{loadingStep || 'Analyzing your GitHub profile...'}</span>
              </div>
            </div>
          ) : (
            <motion.form initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              onSubmit={handleConnect} className="flex gap-2 w-full max-w-sm">
              <input type="text" placeholder="Your GitHub username" value={inputUsername}
                onChange={e => setInputUsername(e.target.value)} id="github-username-input"
                className="flex-1 px-3 py-2.5 rounded-xl text-sm focus:outline-none transition-all"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--bg-card-border)', color: 'var(--text-primary)' }}
                onFocus={e => e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)'}
                onBlur={e => e.currentTarget.style.borderColor = 'var(--bg-card-border)'} />
              <button type="submit"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 0 16px rgba(99,102,241,0.3)' }}>
                <GitBranch size={15} /> Connect
              </button>
            </motion.form>
          )}
          {error && <p className="text-xs text-red-400 mt-3">{error}</p>}
          {saveMsg && <p className="text-xs text-emerald-400 mt-3">{saveMsg}</p>}
        </div>
        <AIAssistant />
      </AppLayout>
    );
  }

  const g = githubData;
  const strengthColor = g.strength >= 70 ? '#10b981' : g.strength >= 50 ? '#f59e0b' : '#8b5cf6';

  return (
    <AppLayout title="GitHub Intelligence" subtitle="Your coding activity, analyzed by AI">
      <div className="p-6 max-w-7xl mx-auto space-y-5">

        {/* Profile card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-5 relative overflow-hidden"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--bg-card-border)' }}>
          {/* Gradient top bar */}
          <div className="absolute top-0 left-0 right-0 h-0.5"
            style={{ background: 'linear-gradient(90deg, #10b981, #14b8a6, #3b82f6, #6366f1)' }} />
          {/* Background glow */}
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at 80% 50%, rgba(16,185,129,0.05), transparent 60%)' }} />

          <div className="relative flex flex-col md:flex-row items-start md:items-center gap-5">
            {g.avatar_url
              ? <img src={g.avatar_url} alt={g.username} className="w-14 h-14 rounded-2xl"
                  style={{ border: '2px solid rgba(99,102,241,0.4)', boxShadow: '0 0 16px rgba(99,102,241,0.2)' }} />
              : <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ background: 'var(--bg-secondary)', border: '1px solid var(--bg-card-border)' }}>
                  <GitBranch size={24} style={{ color: 'var(--text-primary)' }} />
                </div>
            }
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <p className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>@{g.username}</p>
                {g.name && g.name !== g.username && <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{g.name}</span>}
                <div className="w-4 h-4 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(16,185,129,0.15)', boxShadow: '0 0 6px rgba(16,185,129,0.4)' }}>
                  <Check size={10} className="text-emerald-400" />
                </div>
                <a href={g.github_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[10px] text-indigo-400 hover:text-indigo-300 transition-colors">
                  <ExternalLink size={11} /> View on GitHub
                </a>
              </div>
              {g.bio && <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>{g.bio}</p>}
              <div className="flex flex-wrap gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
                <span className="flex items-center gap-1"><GitBranch size={11} />{g.repos} repos</span>
                <span className="flex items-center gap-1"><Star size={11} className="text-amber-400" />{g.stars} stars</span>
                <span>{g.followers} followers</span>
              </div>
            </div>
            <div className="flex flex-col items-center md:items-end gap-2">
              <div className="flex flex-col items-center">
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>GitHub Strength</p>
                <motion.p className="text-3xl font-bold"
                  initial={{ scale: 0.5 }} animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  style={{ color: strengthColor, textShadow: `0 0 20px ${strengthColor}60` }}>
                  {g.strength}
                </motion.p>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>out of 100</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => fetchGitHubAnalysis(true)} disabled={analyzing}
                  className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg transition-all"
                  style={{ border: '1px solid var(--bg-card-border)', color: 'var(--text-muted)' }}>
                  <RefreshCw size={10} className={analyzing ? 'animate-spin' : ''} /> Refresh
                </button>
                <button onClick={handleDisconnect}
                  className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg transition-all"
                  style={{ border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>
                  <X size={10} /> Disconnect
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* AI Summary */}
        {g.ai_summary && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="rounded-2xl p-4 flex items-start gap-3"
            style={{ background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.22)' }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(99,102,241,0.18)', boxShadow: '0 0 12px rgba(99,102,241,0.2)' }}>
              <Sparkles size={14} className="text-indigo-400" />
            </div>
            <div>
              <p className="text-xs text-indigo-400 font-semibold uppercase tracking-wider mb-1">AI Analysis</p>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{g.ai_summary}</p>
            </div>
          </motion.div>
        )}

        {/* Resume consistency */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--bg-card-border)' }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Resume ↔ GitHub Evidence Consistency</h3>
          <div className="flex items-center gap-4 mb-5">
            <div className="text-3xl font-bold text-emerald-400" style={{ textShadow: '0 0 16px rgba(16,185,129,0.4)' }}>{g.resume_consistency}%</div>
            <div className="flex-1">
              <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
                <motion.div initial={{ width: 0 }} animate={{ width: `${g.resume_consistency}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, #10b981, #14b8a6)', boxShadow: '0 0 8px rgba(16,185,129,0.4)' }} />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            {(g.consistency_points || []).map((point, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(16,185,129,0.15)', boxShadow: '0 0 6px rgba(16,185,129,0.3)' }}>
                  <Check size={9} className="text-emerald-400" />
                </div>
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{point}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Languages */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--bg-card-border)' }}>
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Code2 size={14} className="text-indigo-400" /> Languages Used
            </h3>
            <div className="space-y-3">
              {(g.languages || []).map((lang, i) => (
                <div key={lang.name}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span style={{ color: 'var(--text-secondary)' }}>{lang.name}</span>
                    <span className="font-bold" style={{ color: lang.color, textShadow: `0 0 6px ${lang.color}50` }}>{lang.percentage}%</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${lang.percentage}%` }}
                      transition={{ delay: 0.3 + i * 0.1, duration: 0.7, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ background: lang.color, boxShadow: `0 0 6px ${lang.color}60` }} />
                  </div>
                </div>
              ))}
              {(!g.languages || g.languages.length === 0) && (
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No language data found in repositories.</p>
              )}
            </div>
          </motion.div>

          {/* Top repos */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--bg-card-border)' }}>
            <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Top Repositories</h3>
            <div className="space-y-3">
              {(g.repos_list || []).map((repo) => (
                <a key={repo.name} href={repo.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-start gap-3 p-3 rounded-xl transition-all block"
                  style={{ background: 'var(--bg-secondary)', border: '1px solid var(--bg-card-border)' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--bg-card-border)'; e.currentTarget.style.transform = 'none'; }}>
                  <GitBranch size={14} className="flex-shrink-0 mt-0.5 text-indigo-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>{repo.name}</p>
                    <p className="text-[10px] leading-relaxed mt-0.5 line-clamp-2" style={{ color: 'var(--text-muted)' }}>{repo.description}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                      <span className="flex items-center gap-1"><Star size={9} className="text-amber-400" />{repo.stars}</span>
                      {repo.language && <span>{repo.language}</span>}
                      <span>{repo.updated}</span>
                    </div>
                  </div>
                </a>
              ))}
              {(!g.repos_list || g.repos_list.length === 0) && (
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No public repositories found.</p>
              )}
            </div>
          </motion.div>
        </div>

        {/* Code Quality Metrics */}
        <div>
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <TrendingUp size={14} className="text-indigo-400" /> Code Quality Metrics
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {(g.metrics || []).map((m, i) => <MetricCard key={m.label} metric={m} index={i} />)}
          </div>
        </div>
      </div>
      <AIAssistant />
    </AppLayout>
  );
};

export default GitHubPage;
