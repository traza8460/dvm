import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { OpenElectionsCard } from './components/OpenElectionsCard';
import { GeminiAssistantModal } from './components/GeminiAssistantModal';
import { ManifestoModal } from './components/ManifestoModal';
import { ResultsModal } from './components/ResultsModal';
import { AdminModal } from './components/AdminModal';
import { AuthModal } from './components/AuthModal';
import { PitchGeneratorModal } from './components/PitchGeneratorModal';
import { AnimatedBackground } from './components/AnimatedBackground';
import { Sparkles, ShieldCheck, CheckCircle2 } from 'lucide-react';

export function App() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authToken, setAuthToken] = useState<string>('');
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Elections
  const [elections, setElections] = useState<any[]>([]);
  const [isLoadingElections, setIsLoadingElections] = useState(true);

  // Modals
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [isResultsOpen, setIsResultsOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isPitchOpen, setIsPitchOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [toastReceipt, setToastReceipt] = useState<{ code: string; email?: string } | null>(null);
  const [resultsInitialTab, setResultsInitialTab] = useState<'tally' | 'voters' | 'audit'>('tally');

  // Initial local user loading
  useEffect(() => {
    const savedToken = localStorage.getItem('dvm_token');
    const savedUser = localStorage.getItem('dvm_user');
    if (savedToken && savedUser) {
      try {
        setAuthToken(savedToken);
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('dvm_token');
        localStorage.removeItem('dvm_user');
      }
    }
    fetchElections();

    // 🔒 Globally disable text copying & selection (except inside form inputs)
    const handleCopy = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement;
      if (!target || !['INPUT', 'TEXTAREA'].includes(target.tagName)) {
        e.preventDefault();
      }
    };
    const handleSelectStart = (e: Event) => {
      const target = e.target as HTMLElement;
      if (!target || !['INPUT', 'TEXTAREA'].includes(target.tagName)) {
        e.preventDefault();
      }
    };

    document.addEventListener('copy', handleCopy);
    document.addEventListener('selectstart', handleSelectStart);

    return () => {
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('selectstart', handleSelectStart);
    };
  }, []);

  const fetchElections = async () => {
    setIsLoadingElections(true);
    try {
      const res = await fetch('/api/elections/active');
      const data = await res.json();
      setElections(data.elections || []);
    } catch (err) {
      console.error('Error fetching elections', err);
    } finally {
      setIsLoadingElections(false);
    }
  };

  const handleLoginSuccess = (user: any, token: string) => {
    setCurrentUser(user);
    setAuthToken(token);
    fetchElections();
    setTimeout(() => {
      const el = document.getElementById('elections-feed');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 150);
  };

  const handleLogout = () => {
    localStorage.removeItem('dvm_token');
    localStorage.removeItem('dvm_user');
    setCurrentUser(null);
    setAuthToken('');
  };

  const getDeviceId = () => {
    let devId = localStorage.getItem('dvm_device_id');
    if (!devId) {
      devId = 'dev_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now().toString(36);
      localStorage.setItem('dvm_device_id', devId);
    }
    return devId;
  };

  const handleVote = async (electionId: string, candidateId: string) => {
    if (!currentUser || !authToken) {
      setIsAuthOpen(true);
      return;
    }

    const deviceId = getDeviceId();
    const res = await fetch('/api/elections/vote', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({ 
        electionId, 
        candidateId,
        deviceId,
        email: currentUser.email 
      })
    });

    const data = await res.json();
    if (!res.ok) {
      alert(data.message || data.error || 'Failed to submit ballot');
      return;
    }

    // Trigger celebratory confetti
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#818cf8', '#22d3ee', '#ec4899', '#a855f7']
    });

    // Show cryptographic receipt toast
    if (data.receiptHash || data.receiptCode) {
      setToastReceipt({
        code: data.receiptCode || data.receiptHash,
        email: data.sentToEmail || currentUser.email || `${currentUser.studentId.toLowerCase()}@student.edu`
      });
      setTimeout(() => setToastReceipt(null), 10000);
    }

    // Refresh elections state
    fetchElections();
  };

  const currentElection = elections[0] || null;

  return (
    <div className={`min-h-screen ${isDarkMode ? 'text-zinc-100' : 'bg-slate-50 text-slate-900'} transition-colors duration-300 relative select-none font-sans`}>
      
      {/* 🌌 Animated Video Background */}
      {isDarkMode && <AnimatedBackground />}

      <div className="relative z-10">
        {/* Top Navbar */}
        <Navbar
          currentUser={currentUser}
          onOpenAuth={() => setIsAuthOpen(true)}
          onOpenResults={() => setIsResultsOpen(true)}
          onOpenVote={() => {
            if (!currentUser) {
              setIsAuthOpen(true);
            } else {
              const el = document.getElementById('elections-feed');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }
          }}
          onOpenAdmin={() => setIsAdminOpen(true)}
          onLogout={handleLogout}
          isLightMode={!isDarkMode}
          onToggleTheme={() => setIsDarkMode(!isDarkMode)}
        />

        <main className="max-w-6xl mx-auto px-4 sm:px-6 pb-20 pt-1 sm:pt-2 space-y-4 sm:space-y-6">
          {/* Hero Section */}
          <HeroSection
            currentUser={currentUser}
            onCtaClick={() => {
              if (!currentUser) {
                setIsAuthOpen(true);
              } else {
                const el = document.getElementById('elections-feed');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            onLoginSuccess={handleLoginSuccess}
          />

          {/* Elections Feed Card - Only visible after login or signup */}
          {currentUser && (
            <section id="elections-feed" className="animate-fade-in pt-4">
              <OpenElectionsCard
                elections={elections}
                isLoading={isLoadingElections}
                onVote={handleVote}
                onSummarizeManifesto={c => setSelectedCandidate(c)}
                currentUser={currentUser}
                onOpenAuth={() => setIsAuthOpen(true)}
              />
            </section>
          )}
        </main>
      </div>

      {/* Official Voter Receipt Toast */}
      {toastReceipt && (
        <div className="fixed bottom-6 left-6 z-50 max-w-md bg-[#0f111a] border-2 border-emerald-500/60 rounded-2xl p-4 shadow-[0_0_30px_rgba(16,185,129,0.3)] animate-fade-in flex items-start gap-3.5 backdrop-blur-xl">
          <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0 border border-emerald-500/40">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="flex-1 text-xs">
            <div className="font-semibold text-white flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-sm">
                <span>Vote Successfully Cast!</span>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </span>
              <span className="px-2.5 py-0.5 rounded-md font-mono font-black text-xs bg-emerald-950 border border-emerald-500/60 text-emerald-300 tracking-wider">
                {toastReceipt.code}
              </span>
            </div>
            <p className="text-zinc-300 mt-1">
              Your ballot is anonymous and recorded. Here is your official receipt:
            </p>
            <div className="flex items-center justify-between font-mono text-base font-extrabold text-emerald-300 bg-[#141724] p-2.5 rounded-xl mt-2 border border-emerald-500/40 shadow-inner">
              <span className="tracking-widest drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]">{toastReceipt.code}</span>
              <span className="text-[10px] font-sans font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/40">
                OFFICIAL SLIP
              </span>
            </div>
            {toastReceipt.email && (
              <div className="flex items-center gap-1.5 text-[11px] text-zinc-300 mt-2 bg-black/50 px-2.5 py-1.5 rounded-lg border border-zinc-800">
                <span className="text-emerald-400 font-semibold">📧 Receipt sent to:</span>
                <span className="font-mono text-white truncate">{toastReceipt.email}</span>
              </div>
            )}
            <div className="text-[10px] text-zinc-500 mt-1 font-mono">
              🔒 Strict 1-Phone & 1-Email Device Lock Activated
            </div>
          </div>
        </div>
      )}

      {/* Floating Gemini AI Chatbot Trigger (Right Side, 100px lower than center) */}
      <div className="fixed right-5 sm:right-8 top-[calc(50%+100px)] -translate-y-1/2 z-40">
        <button
          onClick={() => setIsAssistantOpen(true)}
          className="group relative flex items-center gap-2.5 px-5 py-3 sm:px-6 sm:py-3.5 rounded-[22px] bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-600 hover:from-sky-300 hover:via-blue-400 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-[0_10px_35px_rgba(14,165,233,0.55)] hover:shadow-[0_14px_45px_rgba(14,165,233,0.8)] hover:scale-105 active:scale-95 transition-all duration-300 border-2 border-sky-200/60 backdrop-blur-xl whitespace-nowrap cursor-pointer"
        >
          {/* Multi-layered soft cloudy blue glow aura */}
          <span className="absolute -inset-2 bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500 rounded-[26px] blur-lg opacity-60 group-hover:opacity-90 transition-opacity -z-10" />
          <span className="absolute -inset-0.5 bg-sky-300/40 rounded-[24px] blur-md -z-10" />
          
          <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse shadow-[0_0_6px_#86efac]" />
          <Sparkles className="w-4.5 h-4.5 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] group-hover:rotate-12 transition-transform duration-300" />
          <span className="tracking-wide drop-shadow-sm">Ask Gemini AI</span>
        </button>
      </div>

      {/* Floating "Vote for your REPRESENTATIVE" - Display Badge (Non-clickable) */}
      <div className="fixed right-5 sm:right-8 top-[calc(50%+250px)] -translate-y-1/2 z-40 select-none pointer-events-none">
        <div className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-[#090e1d]/90 border border-cyan-500/30 text-zinc-300 text-[11px] sm:text-xs font-semibold tracking-wide shadow-[0_6px_20px_rgba(0,0,0,0.6)] backdrop-blur-xl whitespace-nowrap">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_6px_#22d3ee]" />
          <span>Vote for your</span>
          <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-400 to-emerald-400 tracking-wider uppercase">
            REPRESENTATIVE
          </span>
        </div>
      </div>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        initialMode={authMode}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      <GeminiAssistantModal
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        electionContext={currentElection}
      />

      <ManifestoModal
        isOpen={Boolean(selectedCandidate)}
        onClose={() => setSelectedCandidate(null)}
        candidate={selectedCandidate}
        allCandidates={currentElection?.candidates || []}
      />

      <ResultsModal
        isOpen={isResultsOpen}
        onClose={() => setIsResultsOpen(false)}
        electionId={currentElection?.id || ''}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        initialTab={resultsInitialTab}
      />

      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLoginSuccess={handleLoginSuccess}
      />

      <PitchGeneratorModal
        isOpen={isPitchOpen}
        onClose={() => setIsPitchOpen(false)}
      />

    </div>
  );
}

export default App;
