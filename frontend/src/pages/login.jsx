import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import BrandLogo from '../components/BrandLogo';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const response = await api.post('/login/', { username, password });
      login({ access: response.data.access, refresh: response.data.refresh });
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid credentials. Please check your username and password.');
    } finally {
      setIsLoading(false);
    }
  };

  const careerSteps = [
    { icon: '👤', label: 'Student Profile', active: true },
    { icon: '🧬', label: 'Career DNA', active: true },
    { icon: '⚡', label: 'Skill Analysis', active: true },
    { icon: '🗺️', label: 'Career Paths', active: false },
    { icon: '✅', label: 'Job Ready', active: false },
  ];

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-primary)' }}>
      {/* Left: Branding Panel */}
      <div className="hidden lg:flex lg:w-[46%] relative flex-col items-center justify-center p-12 overflow-hidden"
        style={{ background: 'var(--bg-secondary)', borderRight: '1px solid var(--sidebar-border)' }}>

        {/* Morphing blob background */}
        <motion.div
          animate={{
            borderRadius: ['60% 40% 30% 70% / 60% 30% 70% 40%', '30% 60% 70% 40% / 50% 60% 30% 60%', '50% 60% 30% 60% / 30% 40% 60% 50%', '60% 40% 30% 70% / 60% 30% 70% 40%'],
            scale: [1, 1.05, 0.97, 1],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, rgba(139,92,246,0.08) 50%, transparent 80%)' }}
        />
        <motion.div
          animate={{
            borderRadius: ['40% 60% 60% 40% / 60% 30% 40% 50%', '60% 40% 30% 70% / 50% 70% 30% 50%', '30% 60% 70% 40% / 40% 50% 60% 40%', '40% 60% 60% 40% / 60% 30% 40% 50%'],
            scale: [1, 0.95, 1.08, 1],
          }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute bottom-[15%] right-[10%] w-[260px] h-[260px] pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(20,184,166,0.10) 0%, transparent 70%)' }}
        />
        <div className="bg-grid absolute inset-0 opacity-20" />



        <div className="relative z-10 max-w-sm w-full">
          {/* Logo with neon glow */}
          <div className="mb-12">
            <BrandLogo iconSize={36} wordSize="lg" animated={true} />
          </div>

          {/* Career flow steps */}
          <div className="space-y-2.5 mb-10">
            {careerSteps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1, duration: 0.4, type: 'spring', stiffness: 120 }}
                className="flex items-center gap-3 p-3 rounded-xl"
                style={{
                  background: step.active ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${step.active ? 'rgba(99,102,241,0.22)' : 'rgba(255,255,255,0.04)'}`,
                }}
              >
                <motion.div
                  animate={step.active ? { boxShadow: ['0 0 0px transparent', `0 0 10px rgba(99,102,241,0.5)`, '0 0 0px transparent'] } : {}}
                  transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.5 }}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0 border ${
                    step.active ? 'bg-indigo-500/15 border-indigo-500/30' : 'border-transparent'
                  }`}
                  style={!step.active ? { background: 'var(--bg-card)', borderColor: 'var(--bg-card-border)' } : {}}
                >
                  {step.icon}
                </motion.div>
                <span className="text-sm font-medium flex-1" style={{ color: step.active ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                  {step.label}
                </span>
                {step.active && (
                  <motion.div
                    animate={{ opacity: [1, 0.2, 1], scale: [1, 0.7, 1] }}
                    transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.4 }}
                    className="w-2 h-2 rounded-full bg-indigo-400 flex-shrink-0"
                    style={{ boxShadow: '0 0 6px rgba(99,102,241,0.8)' }}
                  />
                )}
                {!step.active && <CheckCircle2 size={14} className="flex-shrink-0" style={{ color: 'var(--text-muted)', opacity: 0.3 }} />}
              </motion.div>
            ))}
          </div>

          {/* Welcome card with holographic shimmer */}
          <div className="p-4 rounded-2xl shimmer-border">
            <h2 className="text-lg font-bold mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}>
              Welcome back
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Your career journey continues here. Sign in to access your personalized roadmap and AI coach.
            </p>
          </div>
        </div>
      </div>

      {/* Right: Form Panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm"
        >
          {/* Mobile logo */}
          <div className="flex justify-center mb-8 lg:hidden">
            <BrandLogo iconSize={32} wordSize="md" animated={true} />
          </div>

          <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Sign in</h1>
          <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>
            Don't have an account?{' '}
            <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
              Create one free
            </Link>
          </p>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/25 flex items-start gap-2.5"
            >
              <span className="text-red-400 flex-shrink-0 mt-0.5">⚠</span>
              <p className="text-xs text-red-300 leading-relaxed">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Username */}
            <div>
              <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                Username
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="w-full rounded-xl pl-10 pr-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  style={{
                    background: 'var(--bg-input)',
                    border: '1px solid var(--bg-card-border)',
                    color: 'var(--text-primary)',
                  }}
                  onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.5)'}
                  onBlur={e => e.target.style.borderColor = 'var(--bg-card-border)'}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                Password
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl pl-10 pr-11 py-3 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  style={{
                    background: 'var(--bg-input)',
                    border: '1px solid var(--bg-card-border)',
                    color: 'var(--text-primary)',
                  }}
                  onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.5)'}
                  onBlur={e => e.target.style.borderColor = 'var(--bg-card-border)'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded accent-indigo-500"
                />
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-medium">
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={!isLoading ? { scale: 1.015, boxShadow: '0 0 28px rgba(99,102,241,0.4)' } : {}}
              whileTap={!isLoading ? { scale: 0.985 } : {}}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 rounded-xl text-sm font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-500/20"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>Sign In <ArrowRight size={15} /></>
              )}
            </motion.button>
          </form>

          <p className="text-center text-xs mt-8" style={{ color: 'var(--text-muted)' }}>
            By signing in, you agree to our{' '}
            <a href="#" className="text-indigo-400 hover:text-indigo-300 transition-colors">Terms of Service</a>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;