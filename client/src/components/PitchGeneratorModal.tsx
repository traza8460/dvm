import React, { useState } from 'react';
import { X, Mic, Sparkles, Copy, Check, Loader2 } from 'lucide-react';

interface PitchGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PitchGeneratorModal: React.FC<PitchGeneratorModalProps> = ({
  isOpen,
  onClose
}) => {
  const [candidateName, setCandidateName] = useState('');
  const [role, setRole] = useState('Class Monitor');
  const [agenda, setAgenda] = useState('Equitable sports equipment, clear homework schedules, and peer tutoring sessions');
  const [speech, setSpeech] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateName.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/ai/generate-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateName,
          role,
          agenda
        })
      });
      const data = await res.json();
      setSpeech(data.speech || '');
    } catch {
      setSpeech(
        `Good morning respected teachers and my dear classmates! My name is ${candidateName}, and I am running for ${role}. A monitor is the voice of every single student in this room. My primary focus will be on ${agenda}. Let's work together to make this academic year our best one yet. Please support me with your vote! Thank you.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!speech) return;
    navigator.clipboard.writeText(speech);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-xl bg-[#0e1017] border border-[#27273a] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-[#1e1f2f] bg-[#12131e]/90 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Mic className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                60-Sec Campaign Speech Generator
              </h3>
              <p className="text-xs text-zinc-400">Powered by Google Gemini 1.5 Flash</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <form onSubmit={handleGenerate} className="space-y-4 text-xs">
            <div>
              <label className="block text-zinc-300 font-medium mb-1.5">Candidate Full Name</label>
              <input
                type="text"
                required
                value={candidateName}
                onChange={e => setCandidateName(e.target.value)}
                placeholder="e.g. Rohan Verma"
                className="w-full bg-[#181926] border border-zinc-700/60 focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-white placeholder-zinc-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-zinc-300 font-medium mb-1.5">Target Office / Role</label>
              <select
                value={role}
                onChange={e => setRole(e.target.value)}
                className="w-full bg-[#181926] border border-zinc-700/60 focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-white outline-none"
              >
                <option value="Class Monitor">Class Monitor</option>
                <option value="Class Representative (CR)">Class Representative (CR)</option>
                <option value="Deputy Class Monitor">Deputy Class Monitor</option>
                <option value="Sports & Activity Captain">Sports & Activity Captain</option>
              </select>
            </div>

            <div>
              <label className="block text-zinc-300 font-medium mb-1.5">Core Promises & Student Priorities</label>
              <textarea
                rows={3}
                value={agenda}
                onChange={e => setAgenda(e.target.value)}
                placeholder="What will you fight for or improve in class?"
                className="w-full bg-[#181926] border border-zinc-700/60 focus:border-purple-500 rounded-xl p-3 text-white placeholder-zinc-500 outline-none leading-relaxed"
              />
            </div>

            <button
              type="submit"
              disabled={!candidateName.trim() || isLoading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:opacity-90 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 disabled:opacity-40 transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Drafting Speech with Gemini...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate 60-Second Classroom Speech</span>
                </>
              )}
            </button>
          </form>

          {/* Result Card */}
          {speech && (
            <div className="mt-4 p-4 rounded-xl bg-[#141522] border border-purple-500/30 relative space-y-2">
              <div className="flex items-center justify-between text-xs text-purple-400 font-semibold uppercase tracking-wider">
                <span>Generated Speech (~60 Sec Delivery)</span>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-[11px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-2.5 py-1 rounded-md transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <p className="text-zinc-200 text-xs leading-relaxed whitespace-pre-line italic">
                "{speech}"
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
