import React, { useState } from 'react';
import { X, UserPlus, ArrowRight, Loader2 } from 'lucide-react';

interface GoogleAccountChooserPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAccount: (account: { email: string; name: string }) => Promise<void>;
  isLoading?: boolean;
}

const GOOGLE_ACCOUNTS = [
  {
    name: 'Tausif Raza',
    email: 'rtausif392@gmail.com',
    bgColor: 'bg-[#1a73e8]',
    initial: 'T',
    badge: 'Signed in'
  },
  {
    name: 'Tausif Raza',
    email: 'traza8819@gmail.com',
    bgColor: 'bg-[#ea4335]',
    initial: 'T'
  },
  {
    name: 'Tausif Raza',
    email: 'tausifraza8460@gmail.com',
    bgColor: 'bg-[#34a853]',
    initial: 'T'
  },
  {
    name: 'Tausif Raza',
    email: 'parakhtiwari07@gmail.com',
    bgColor: 'bg-[#f29900]',
    initial: 'T'
  }
];

export const GoogleAccountChooserPopup: React.FC<GoogleAccountChooserPopupProps> = ({
  isOpen,
  onClose,
  onSelectAccount,
  isLoading = false
}) => {
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customEmail, setCustomEmail] = useState('');

  if (!isOpen) return null;

  const handleChoose = async (email: string, name: string) => {
    setSelectedEmail(email);
    await onSelectAccount({ email, name });
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail || !customEmail.includes('@')) return;
    const name = customEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    await handleChoose(customEmail, name);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-[400px] bg-[#202124] border border-[#3c4043] rounded-[28px] shadow-[0_24px_48px_rgba(0,0,0,0.85)] p-6 text-left relative transition-all"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full hover:bg-[#303134] text-[#9aa0a6] hover:text-[#e8eaed] flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Google Header */}
        <div className="flex flex-col items-center text-center pb-5 border-b border-[#3c4043]/80">
          <svg className="w-7 h-7 mb-3" viewBox="0 0 24 24">
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
          <h3 className="text-xl font-normal text-[#e8eaed] tracking-tight">Choose an account</h3>
          <p className="text-xs text-[#9aa0a6] mt-1">to continue to Digital Voting Machine</p>
        </div>

        {/* Google Account List */}
        <div className="py-2 divide-y divide-[#3c4043]/50 max-h-[340px] overflow-y-auto">
          {GOOGLE_ACCOUNTS.map(account => {
            const isPending = isLoading && selectedEmail === account.email;

            return (
              <div
                key={account.email}
                onClick={() => !isLoading && handleChoose(account.email, account.name)}
                className="py-3 px-2 rounded-xl hover:bg-[#303134] transition-colors cursor-pointer flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Google Profile Circle Avatar */}
                  <div className={`w-10 h-10 rounded-full ${account.bgColor} text-white flex items-center justify-center font-medium text-base shadow-sm shrink-0`}>
                    {account.initial}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[#e8eaed] group-hover:text-white truncate">
                        {account.name}
                      </span>
                      {account.badge && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
                          {account.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-[#9aa0a6] block truncate mt-0.5">
                      {account.email}
                    </span>
                  </div>
                </div>

                <div className="shrink-0 text-cyan-400 pr-1">
                  {isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <ArrowRight className="w-4 h-4 text-[#9aa0a6] opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
              </div>
            );
          })}

          {/* Use another account option */}
          <div className="pt-2">
            {!showCustomInput ? (
              <div
                onClick={() => setShowCustomInput(true)}
                className="py-3 px-2 rounded-xl hover:bg-[#303134] transition-colors cursor-pointer flex items-center gap-3.5 group"
              >
                <div className="w-10 h-10 rounded-full bg-[#303134] group-hover:bg-[#3c4043] text-[#9aa0a6] group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-sm font-medium text-[#e8eaed] block">
                    Use another account
                  </span>
                  <span className="text-xs text-[#9aa0a6] block">
                    Sign in with any other Google account
                  </span>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCustomSubmit} className="p-3 my-1 rounded-2xl bg-[#17181a] border border-[#3c4043] space-y-2.5">
                <label className="text-xs font-medium text-[#e8eaed] block">Enter Google Email:</label>
                <input
                  type="email"
                  autoFocus
                  required
                  placeholder="your.email@gmail.com"
                  value={customEmail}
                  onChange={e => setCustomEmail(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#202124] border border-[#5f6368] text-xs text-white placeholder-[#9aa0a6] outline-none focus:border-[#8ab4f8]"
                />
                <div className="flex items-center justify-between gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowCustomInput(false)}
                    className="text-xs text-[#9aa0a6] hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-1.5 rounded-xl bg-[#8ab4f8] hover:bg-[#aecbfa] text-[#202124] font-bold text-xs"
                  >
                    Next
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Footer Notice matching Google OAuth */}
        <div className="pt-4 border-t border-[#3c4043]/80 text-[11px] text-[#9aa0a6] leading-relaxed text-center">
          To continue, Google will share your name, email address, and profile picture with <span className="text-[#e8eaed] font-medium">Digital Voting Machine</span>.
        </div>
      </div>
    </div>
  );
};