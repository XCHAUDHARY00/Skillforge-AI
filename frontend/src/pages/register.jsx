import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, Check } from 'lucide-react';
import api from '../api';
import BrandLogo from '../components/BrandLogo';

const PasswordStrengthBar = ({ password }) => {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const strength = checks.filter(Boolean).length;
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['', '#ef4444', '#f59e0b', '#3b82f6', '#10b981'];

  if (!password) return null;

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="flex-1 h-1 rounded-full transition-all duration-300"
            style={{ backgroundColor: i < strength ? colors[strength] : 'var(--bg-card-border)' }}
          />
        ))}
      </div>
      <p className="text-[10px] font-medium" style={{ color: colors[strength] || 'var(--text-muted)' }}>
        {labels[strength]}
      </p>
    </div>
  );
};

const InputField = ({ label, icon: Icon, children, rightElement }) => (
  <div>
    <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
      {label}
    </label>
    <div className="relative">
      {Icon && <Icon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />}
      {children}
      {rightElement}
    </div>
  </div>
);

const Register = () => {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const update = (field, val) => setForm(prev => ({ ...prev, [field]: val }));

  const handleRegister = async (e) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!agreedTerms) {
      setError('Please accept the terms and conditions.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      await api.post('/register/', {
        username: form.username,
        email: form.email,
        password: form.password,
        first_name: form.first_name,
        last_name: form.last_name,
      });
      navigate('/login');
    } catch (err) {
      const data = err.response?.data;
      if (data) {
        const firstError = Object.values(data)[0];
        setError(Array.isArray(firstError) ? firstError[0] : firstError);
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = "w-full rounded-xl py-2.5 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/30";
  const inputStyle = {
    background: 'var(--bg-input)',
    border: '1px solid var(--bg-card-border)',
    color: 'var(--text-primary)',
  };
  const handleFocus = e => (e.target.style.borderColor = 'rgba(99,102,241,0.5)');
  const handleBlur = e => (e.target.style.borderColor = 'var(--bg-card-border)');

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 relative" style={{ background: 'var(--bg-primary)' }}>
      {/* Ambient background orbs */}
      <div className="fixed top-1/3 left-1/4 w-[500px] h-[500px] rounded-full bg-indigo-600/6 blur-[160px] pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-violet-600/6 blur-[140px] pointer-events-none" />
      <div className="bg-grid fixed inset-0 opacity-25 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex mb-6">
            <BrandLogo iconSize={32} wordSize="sm" animated={true} />
          </Link>
          <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Create your account</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Already have one?{' '}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
              Sign in
            </Link>
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-6 shadow-2xl border" style={{ background: 'var(--bg-card)', borderColor: 'var(--bg-card-border)' }}>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/25 flex items-start gap-2.5"
            >
              <span className="text-red-400 flex-shrink-0 mt-0.5">⚠</span>
              <p className="text-xs text-red-300 leading-relaxed">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            {/* First + Last name */}
            <div className="grid grid-cols-2 gap-3">
              {['first_name', 'last_name'].map(field => (
                <div key={field}>
                  <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                    {field === 'first_name' ? 'First Name' : 'Last Name'}
                  </label>
                  <input
                    type="text"
                    required
                    value={form[field]}
                    onChange={e => update(field, e.target.value)}
                    placeholder={field === 'first_name' ? 'First name' : 'Last name'}
                    className={`${inputClass} px-3`}
                    style={inputStyle}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
                </div>
              ))}
            </div>

            {/* Username */}
            <InputField label="Username" icon={User}>
              <input
                type="text"
                required
                value={form.username}
                onChange={e => update('username', e.target.value)}
                placeholder="Enter username"
                className={`${inputClass} pl-9 pr-4`}
                style={inputStyle}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            </InputField>

            {/* Email */}
            <InputField label="Email" icon={Mail}>
              <input
                type="email"
                required
                value={form.email}
                onChange={e => update('email', e.target.value)}
                placeholder="Enter email address"
                className={`${inputClass} pl-9 pr-4`}
                style={inputStyle}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            </InputField>

            {/* Password */}
            <div>
              <InputField label="Password" icon={Lock}
                rightElement={
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ color: 'var(--text-muted)' }}>
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                }
              >
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={e => update('password', e.target.value)}
                  placeholder="Min 8 characters"
                  className={`${inputClass} pl-9 pr-10`}
                  style={inputStyle}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
              </InputField>
              <PasswordStrengthBar password={form.password} />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                Confirm Password
              </label>
              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  required
                  value={form.confirmPassword}
                  onChange={e => update('confirmPassword', e.target.value)}
                  placeholder="••••••••"
                  className={`${inputClass} pl-9 pr-16`}
                  style={{
                    ...inputStyle,
                    borderColor: form.confirmPassword
                      ? form.password !== form.confirmPassword
                        ? 'rgba(239,68,68,0.5)'
                        : 'rgba(16,185,129,0.5)'
                      : 'var(--bg-card-border)',
                  }}
                  onFocus={e => e.target.style.borderColor = form.confirmPassword
                    ? form.password !== form.confirmPassword ? 'rgba(239,68,68,0.7)' : 'rgba(16,185,129,0.7)'
                    : 'rgba(99,102,241,0.5)'}
                  onBlur={e => e.target.style.borderColor = form.confirmPassword
                    ? form.password !== form.confirmPassword ? 'rgba(239,68,68,0.5)' : 'rgba(16,185,129,0.5)'
                    : 'var(--bg-card-border)'}
                />
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                  {form.confirmPassword && form.password === form.confirmPassword && (
                    <Check size={13} className="text-emerald-400" />
                  )}
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    className="transition-colors" style={{ color: 'var(--text-muted)' }}>
                    {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Terms */}
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={agreedTerms}
                onChange={e => setAgreedTerms(e.target.checked)}
                className="mt-0.5 w-3.5 h-3.5 rounded accent-indigo-500"
              />
              <span className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                I agree to the{' '}
                <a href="#" className="text-indigo-400 hover:text-indigo-300 transition-colors">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-indigo-400 hover:text-indigo-300 transition-colors">Privacy Policy</a>
              </span>
            </label>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={!isLoading ? { scale: 1.015, boxShadow: '0 0 28px rgba(99,102,241,0.4)' } : {}}
              whileTap={!isLoading ? { scale: 0.985 } : {}}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 rounded-xl text-sm font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-2 shadow-lg shadow-indigo-500/20"
            >
              {isLoading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating account...</>
              ) : (
                <>Create My SkillForge Account <ArrowRight size={15} /></>
              )}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
