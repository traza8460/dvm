import React, { useState, useEffect } from 'react';
import { X, Lock, User, GraduationCap, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: any, token: string) => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialMode = 'login'
}) => {
  const [isRegister, setIsRegister] = useState(initialMode === 'register');
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [className, setClassName] = useState('Grade 11-A');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsRegister(initialMode === 'register');
    setError('');
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
    const payload = isRegister 
      ? { studentId, password, fullName, className, role: 'STUDENT' }
      : { studentId, password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      localStorage.setItem('dvm_token', data.token);
      localStorage.setItem('dvm_user', JSON.stringify(data.user));
      onLoginSuccess(data.user, data.token);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = (type: 'student' | 'admin') => {
    if (type === 'student') {
      setStudentId('STU-001');
      setPassword('pass123');
    } else {
      setStudentId('ADMIN-001');
      setPassword('admin123');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md bg-[#0e1017] border border-[#27273a] rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-[#1e1f2f] bg-[#12131e]/90 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {isRegister ? 'Student Registration' : 'Student & Admin Sign In'}
              </h3>
              <p className="text-xs text-zinc-400">Class Monitor / CR Voting Portal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Demo Fillers */}
        <div className="p-4 bg-[#141522] border-b border-[#1e1f2f] flex items-center justify-between text-xs">
          <span className="text-zinc-400 flex items-center gap-1 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" /> 1-Click Demo:
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('student')}
              className="px-2.5 py-1 rounded-md bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono transition-colors"
            >
              Demo Student
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('admin')}
              className="px-2.5 py-1 rounded-md bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono transition-colors"
            >
              Demo Admin
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs">
              {error}
            </div>
          )}

          {isRegister && (
            <>
              <div>
                <label className="block text-zinc-300 font-medium mb-1.5">Full Student Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full bg-[#181926] border border-zinc-700/60 focus:border-purple-500 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-zinc-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1.5">Class / Section</label>
                <input
                  type="text"
                  required
                  value={className}
                  onChange={e => setClassName(e.target.value)}
                  placeholder="Grade 11-A"
                  className="w-full bg-[#181926] border border-zinc-700/60 focus:border-purple-500 rounded-xl px-4 py-2.5 text-white placeholder-zinc-500 outline-none"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-zinc-300 font-medium mb-1.5">Student ID or Admin ID</label>
            <div className="relative">
              <GraduationCap className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={studentId}
                onChange={e => setStudentId(e.target.value)}
                placeholder="e.g. STU-001 or ADMIN-001"
                className="w-full bg-[#181926] border border-zinc-700/60 focus:border-purple-500 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-zinc-500 outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-zinc-300 font-medium mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#181926] border border-zinc-700/60 focus:border-purple-500 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-zinc-500 outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/25 disabled:opacity-50 transition-all"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>{isRegister ? 'Complete Registration' : 'Authenticate & Enter'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
              }}
              className="text-zinc-400 hover:text-purple-300 transition-colors"
            >
              {isRegister
                ? 'Already registered? Click here to Login'
                : 'First-time voter? Click here to Register'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
