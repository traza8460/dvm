import React from 'react';
import { Vote, BarChart3, Sun, Moon, LogIn, LogOut, UserCheck, ShieldAlert } from 'lucide-react';

interface NavbarProps {
  onOpenResults: () => void;
  onOpenVote: () => void;
  onOpenAuth: () => void;
  onOpenAdmin: () => void;
  currentUser: any;
  onLogout: () => void;
  isLightMode: boolean;
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenResults,
  onOpenVote,
  onOpenAuth,
  onOpenAdmin,
  currentUser,
  onLogout,
  isLightMode,
  onToggleTheme
}) => {
  return (
    <header className="w-full border-b border-zinc-800/80 bg-[#09090b]/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
        
        {/* LOGO: Top-Left Glowing Purple Badge + Text with Tricolor Accent */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-[0_0_15px_rgba(129,140,248,0.5)] border border-indigo-400/30">
            <Vote className="w-6 h-6 text-white" />
          </div>
          <div className="relative">
            <div className="text-xl sm:text-2xl font-black tracking-wider flex items-center">
              <span className="text-[#FF671F] drop-shadow-[0_0_12px_rgba(255,103,31,0.6)]">D</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#818cf8] via-[#a5b4fc] to-[#6366f1] mx-1.5 drop-shadow-[0_0_12px_rgba(129,140,248,0.6)]">V</span>
              <span className="text-[#4ade80] drop-shadow-[0_0_12px_rgba(74,222,128,0.6)]">M</span>
            </div>
            {/* Tricolor accent with pure white in the middle matching Digital Voting Machine lines */}
            <div className="h-[2px] sm:h-[2.5px] w-full bg-gradient-to-r from-[#FF671F] via-white to-[#046A38] rounded-full shadow-[0_0_10px_rgba(255,255,255,0.7)] mt-0.5" />
          </div>
        </div>

        {/* NAVIGATION: Right-Side Pill Buttons */}
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          
          {/* Vote Pill (Display only - non-clickable) */}
          <div
            className="flex items-center gap-2 px-4.5 py-2.5 rounded-full bg-zinc-900/90 text-zinc-200 border border-zinc-800 text-sm font-semibold shadow-sm select-none pointer-events-none"
          >
            <Vote className="w-4.5 h-4.5 text-indigo-400" />
            <span className="hidden xs:inline">Vote</span>
          </div>

          {/* Results Pill (Display only - non-clickable) */}
          <div
            className="flex items-center gap-2 px-4.5 py-2.5 rounded-full bg-zinc-900/90 text-zinc-200 border border-zinc-800 text-sm font-semibold shadow-sm select-none pointer-events-none"
          >
            <BarChart3 className="w-4.5 h-4.5 text-cyan-400" />
            <span className="hidden xs:inline">Results</span>
          </div>

          {/* Dark / Light Toggle (Enlarged next to removed login) */}
          <button
            onClick={onToggleTheme}
            className="p-3 sm:px-4 sm:py-2.5 rounded-full bg-zinc-900/95 hover:bg-zinc-800 text-zinc-200 hover:text-amber-300 border border-zinc-700/80 shadow-md transition-all duration-200 flex items-center gap-2"
            title="Toggle theme"
          >
            {isLightMode ? <Moon className="w-5 h-5 text-indigo-300" /> : <Sun className="w-5 h-5 text-amber-400" />}
            <span className="hidden sm:inline text-xs font-semibold">{isLightMode ? 'Dark' : 'Light'}</span>
          </button>

          {/* Dedicated Admin Portal Button (Always Visible) */}
          <button
            onClick={onOpenAdmin}
            className="flex items-center gap-1.5 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-full bg-gradient-to-r from-rose-950/80 via-purple-950/70 to-indigo-950/80 hover:from-rose-900 hover:to-indigo-900 border border-rose-500/50 hover:border-rose-400 text-rose-300 hover:text-white text-xs sm:text-sm font-bold shadow-[0_0_15px_rgba(244,63,94,0.3)] transition-all cursor-pointer active:scale-95"
            title="Admin Portal (Who Voted for Whom)"
          >
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>Admin</span>
          </button>

          {/* User Account / Logout (When logged in) */}
          {currentUser && (
            <div className="flex items-center gap-2 pl-2">
              <div className="hidden md:flex flex-col text-right">
                <span className="text-xs font-bold text-white leading-tight">{currentUser.fullName}</span>
                <span className="text-[10px] font-mono text-indigo-300">{currentUser.studentId}</span>
              </div>
              <button
                onClick={onLogout}
                className="p-2.5 rounded-full bg-zinc-900 hover:bg-red-950/40 text-zinc-400 hover:text-red-400 border border-zinc-800 hover:border-red-500/30 transition-all"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>

      </div>
    </header>
  );
};
