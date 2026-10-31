import React, { useState } from 'react';
import { 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Loader2,
  User
} from 'lucide-react';
import { GoogleAccountChooserPopup } from './GoogleAccountChooserPopup';

interface HeroSectionProps {
  onCtaClick: () => void;
  currentUser: any;
  onLoginSuccess?: (user: any, token: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ 
  onCtaClick, 
  currentUser,
  onLoginSuccess
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGooglePopupOpen, setIsGooglePopupOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const isRegister = activeTab === 'signup';
    const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
    const payload = isRegister ? { email, password, fullName } : { email, password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || 'Authentication failed');
      }

      localStorage.setItem('dvm_token', data.token);
      localStorage.setItem('dvm_user', JSON.stringify(data.user));
      if (onLoginSuccess) {
        onLoginSuccess(data.user, data.token);
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectGoogleAccount = async (account: { email: string; name: string }) => {
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: account.email,
          fullName: account.name
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Google authentication failed');
      }
      localStorage.setItem('dvm_token', data.token);
      localStorage.setItem('dvm_user', JSON.stringify(data.user));
      setIsGooglePopupOpen(false);
      if (onLoginSuccess) {
        onLoginSuccess(data.user, data.token);
      }
    } catch (err: any) {
      setError(err.message || 'Google authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="relative pt-2 pb-2 sm:pt-4 sm:pb-3 overflow-hidden text-center">
      
      {/* Background Ambient Radial Glows (Deep Dark Moody Cyber-Tricolor) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[340px] bg-gradient-to-r from-[#d95304]/12 via-white/5 to-[#046A38]/12 blur-[150px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-1/4 left-1/4 w-[280px] h-[180px] bg-[#d95304]/10 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-[280px] h-[180px] bg-[#046A38]/10 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto px-2 sm:px-6 flex flex-col items-center">

        {/* TRICOLOR ACCENT: Top & Bottom Lines Only */}
        <div className="relative mb-4 px-4 sm:px-8 py-3 w-full max-w-5xl mx-auto flex justify-center">
          {/* Top Tricolor Line */}
          <div className="absolute top-0 left-2 right-2 sm:left-6 sm:right-6 h-[3px] bg-gradient-to-r from-[#FF671F] via-white to-[#046A38] rounded-full shadow-[0_0_15px_rgba(255,103,31,0.7)]" />
          
          {/* Bottom Tricolor Line */}
          <div className="absolute bottom-0 left-2 right-2 sm:left-6 sm:right-6 h-[3px] bg-gradient-to-r from-[#FF671F] via-white to-[#046A38] rounded-full shadow-[0_0_15px_rgba(4,106,56,0.7)]" />

          {/* Main Headline - Single line (slightly more compact) */}
          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-[54px] xl:text-[62px] font-black tracking-tight leading-none whitespace-nowrap text-center select-none py-1">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF671F] via-[#ff8c38] to-[#f97316] drop-shadow-[0_4px_24px_rgba(255,103,31,0.6)]">
              Digital{' '}
            </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#818cf8] via-[#a5b4fc] to-[#6366f1] drop-shadow-[0_4px_24px_rgba(255,255,255,0.4)]">
              Voting{' '}
            </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4ade80] via-[#22c55e] to-[#10b981] drop-shadow-[0_4px_24px_rgba(74,222,128,0.5)]">
              Machine
            </span>
          </h1>
        </div>

        {/* ============================================================ */}
        {/* EXACT REFERENCE IMAGE LOGIN & SIGNUP CARD (Wider & Compact)  */}
        {/* ============================================================ */}
        <div className="w-full max-w-[680px] sm:max-w-[720px] mx-auto my-2 px-3 sm:px-0">
          
          {/* Top Wall Lamp Light Fixture & Warm Spotlight Beam */}
          <div className="relative flex flex-col items-center mb-[-6px] pointer-events-none">
            <div className="w-24 sm:w-28 h-3.5 bg-gradient-to-b from-zinc-700 to-zinc-900 rounded-t-md border-t border-zinc-500 shadow-md" />
            <div className="w-20 h-1.5 bg-amber-200/90 rounded-full shadow-[0_0_20px_#fde68a]" />
            <div className="w-72 sm:w-96 h-16 bg-gradient-to-b from-amber-300/30 via-amber-400/10 to-transparent blur-xl -mt-1" />
          </div>

          {/* Glassmorphic Neon Card (Wider Width & Compact Height) */}
          <div className="relative rounded-[30px] bg-[#090e1d]/90 backdrop-blur-2xl border-2 border-cyan-500/40 shadow-[0_0_55px_rgba(6,182,212,0.26),inset_0_0_25px_rgba(6,182,212,0.06)] p-6 sm:px-10 sm:py-7 text-left transition-all">
            
            {currentUser ? (
              /* Already Logged In State */
              <div className="text-center py-4 space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-emerald-400 text-slate-950 flex items-center justify-center mx-auto shadow-xl shadow-cyan-500/30">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{currentUser.fullName}</h3>
                  <p className="text-xs sm:text-sm font-mono text-cyan-300 mt-0.5">{currentUser.studentId} • {currentUser.className || 'Grade 11-A'}</p>
                  <span className="inline-block mt-2 px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
                    ✓ Verified Student Voter
                  </span>
                </div>
                <button
                  onClick={onCtaClick}
                  className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#00c6ff] via-[#00e5a3] to-[#00f5a0] text-slate-950 font-black text-base shadow-[0_6px_25px_rgba(0,245,160,0.45)] hover:shadow-[0_8px_35px_rgba(0,245,160,0.65)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <span>Cast Your Ballot Now</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            ) : (
              /* Auth Form (Login / Sign Up in 1 Box) */
              <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
                
                {/* Mode Switch Tabs (Login / Sign Up) */}
                <div className="flex items-center justify-center gap-2 p-1 rounded-full bg-[#060a14] border border-cyan-500/30 max-w-[240px] mx-auto mb-2">
                  <button
                    type="button"
                    onClick={() => { setActiveTab('login'); setError(''); }}
                    className={`flex-1 py-1.5 px-5 rounded-full text-xs sm:text-sm font-bold transition-all ${
                      activeTab === 'login'
                        ? 'bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 shadow-md shadow-cyan-500/40'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    onClick={() => { setActiveTab('signup'); setError(''); }}
                    className={`flex-1 py-1.5 px-5 rounded-full text-xs sm:text-sm font-bold transition-all ${
                      activeTab === 'signup'
                        ? 'bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 shadow-md shadow-emerald-500/40'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Sign Up
                  </button>
                </div>

                {/* Main Neon Title: Login or Sign Up */}
                <h2 className="text-3xl sm:text-4xl font-black text-center tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#00d2ff] via-[#00e5a3] to-[#00f5a0] drop-shadow-[0_4px_20px_rgba(0,210,255,0.45)] mb-3">
                  {activeTab === 'login' ? 'Login' : 'Sign Up'}
                </h2>

                {error && (
                  <div className="p-2.5 rounded-2xl bg-rose-950/40 border border-rose-500/50 text-rose-300 text-xs sm:text-sm text-center">
                    {error}
                  </div>
                )}

                {/* Full Name Input (Only on Sign Up) */}
                {activeTab === 'signup' && (
                  <div className="relative flex items-center rounded-full bg-[#0b1222]/95 border-2 border-sky-600/40 focus-within:border-cyan-400 focus-within:shadow-[0_0_15px_rgba(6,182,212,0.35)] px-5 py-3 sm:py-3.5 transition-all">
                    <User className="w-4.5 h-4.5 text-cyan-400 shrink-0 mr-3" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      placeholder="Full Name"
                      className="w-full bg-transparent outline-none text-xs sm:text-sm text-white placeholder-zinc-500 font-medium"
                    />
                  </div>
                )}

                {/* Email ID Input (Exact pill with Mail icon) */}
                <div className="relative flex items-center rounded-full bg-[#0b1222]/95 border-2 border-sky-600/40 focus-within:border-cyan-400 focus-within:shadow-[0_0_15px_rgba(6,182,212,0.35)] px-5 py-3 sm:py-3.5 transition-all">
                  <Mail className="w-4.5 h-4.5 text-cyan-400 shrink-0 mr-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Email ID"
                    className="w-full bg-transparent outline-none text-xs sm:text-sm text-white placeholder-zinc-500 font-medium"
                  />
                </div>

                {/* Password Input (Exact pill with lock icon + eye toggle) */}
                <div className="relative flex items-center rounded-full bg-[#0b1222]/95 border-2 border-sky-600/40 focus-within:border-cyan-400 focus-within:shadow-[0_0_15px_rgba(6,182,212,0.35)] px-5 py-3 sm:py-3.5 transition-all">
                  <Lock className="w-4.5 h-4.5 text-cyan-400 shrink-0 mr-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full bg-transparent outline-none text-xs sm:text-sm text-white placeholder-zinc-500 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-cyan-400 hover:text-cyan-300 ml-2 focus:outline-none transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                  </button>
                </div>

                {/* Remember me Row */}
                <div className="flex items-center text-xs text-zinc-400 pt-0.5 px-2">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={e => setRememberMe(e.target.checked)}
                      className="w-3.5 h-3.5 rounded bg-[#0b1222] border-cyan-500/50 text-cyan-400 focus:ring-0 focus:ring-offset-0"
                    />
                    <span>Remember me</span>
                  </label>
                </div>

                {/* Radiant Pill Action Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 sm:py-4 rounded-full bg-gradient-to-r from-[#00c6ff] via-[#00e5a3] to-[#00f5a0] hover:opacity-95 text-slate-950 font-black text-sm sm:text-base shadow-[0_5px_25px_rgba(0,245,160,0.45)] hover:shadow-[0_8px_35px_rgba(0,245,160,0.65)] hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2 tracking-wide"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <span>{activeTab === 'login' ? 'Login' : 'Sign Up'}</span>
                  )}
                </button>

                {/* Small Google Login / Signup Button */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setIsGooglePopupOpen(true)}
                    disabled={isLoading}
                    className="w-full py-2.5 px-4 rounded-full bg-[#070c18] hover:bg-[#0b1324] border border-cyan-500/30 hover:border-cyan-400/60 text-zinc-200 hover:text-white text-xs font-semibold flex items-center justify-center gap-2.5 transition-all shadow-sm hover:shadow-[0_0_15px_rgba(6,182,212,0.25)] active:scale-[0.99] cursor-pointer"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>{activeTab === 'login' ? 'Continue with Google' : 'Sign up with Google'}</span>
                  </button>
                </div>

                {/* Bottom Switch Link */}
                <div className="text-center pt-1 text-xs text-zinc-400">
                  {activeTab === 'login' ? (
                    <>
                      Don't have an account?{' '}
                      <button
                        type="button"
                        onClick={() => { setActiveTab('signup'); setError(''); }}
                        className="text-emerald-400 hover:text-emerald-300 font-bold ml-1 transition-colors underline"
                      >
                        Register
                      </button>
                    </>
                  ) : (
                    <>
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => { setActiveTab('login'); setError(''); }}
                        className="text-cyan-400 hover:text-cyan-300 font-bold ml-1 transition-colors underline"
                      >
                        Login
                      </button>
                    </>
                  )}
                </div>

              </form>
            )}

          </div>
        </div>

        {/* TRICOLOR ACCENT: Top & Bottom Lines around bottom badges */}
        <div className="relative mt-5 mb-2 px-4 sm:px-8 py-3 w-full max-w-5xl mx-auto flex flex-col items-center">
          {/* Top Tricolor Line */}
          <div className="absolute top-0 left-2 right-2 sm:left-6 sm:right-6 h-[3px] bg-gradient-to-r from-[#FF671F] via-white to-[#046A38] rounded-full shadow-[0_0_15px_rgba(255,103,31,0.7)]" />

          {/* FULLY SECURED VOTING badge */}
          <div className="my-1 inline-flex items-center gap-2 px-5 py-2 rounded-full bg-zinc-950/90 border border-indigo-500/40 text-indigo-300 text-xs sm:text-sm font-semibold tracking-wide uppercase shadow-[0_0_20px_rgba(99,102,241,0.25)]">
            <span className="text-indigo-400 font-bold text-sm">☆</span>
            <span>FULLY SECURED VOTING</span>
          </div>

          {/* ONE PERSON ONE VOTE ONE VALUE badge */}
          <div className="my-1 inline-flex items-center gap-2 px-5 py-2 rounded-full bg-zinc-950/90 border border-indigo-500/40 text-indigo-300 text-xs sm:text-sm font-semibold tracking-wide uppercase shadow-[0_0_20px_rgba(99,102,241,0.25)]">
            <span className="text-indigo-400 font-bold text-sm">☆</span>
            <span>One Person One Vote One Value</span>
          </div>

          {/* Bottom Tricolor Line */}
          <div className="absolute bottom-0 left-2 right-2 sm:left-6 sm:right-6 h-[3px] bg-gradient-to-r from-[#FF671F] via-white to-[#046A38] rounded-full shadow-[0_0_15px_rgba(4,106,56,0.7)]" />
        </div>

      </div>

      {/* Google Account Chooser Popup */}
      <GoogleAccountChooserPopup
        isOpen={isGooglePopupOpen}
        onClose={() => setIsGooglePopupOpen(false)}
        onSelectAccount={handleSelectGoogleAccount}
        isLoading={isLoading}
      />
    </section>
  );
};
