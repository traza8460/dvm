import React, { useState } from 'react';
import { Vote, Sparkles, Check, AlertCircle, Clock, CheckCircle2, ChevronRight, FileText } from 'lucide-react';

interface Candidate {
  id: string;
  fullName: string;
  studentId: string;
  slogan: string;
  manifesto: string;
  summaryAI?: string;
  avatarUrl: string;
  voteCount: number;
}

interface Election {
  id: string;
  title: string;
  description: string;
  targetClass: string;
  status: string;
  candidates: Candidate[];
  hasVoted?: boolean;
}

interface OpenElectionsCardProps {
  elections: Election[];
  isLoading: boolean;
  onVote: (electionId: string, candidateId: string) => Promise<void>;
  onSummarizeManifesto: (candidate: Candidate) => void;
  currentUser: any;
  onOpenAuth: () => void;
}

export const OpenElectionsCard: React.FC<OpenElectionsCardProps> = ({
  elections,
  isLoading,
  onVote,
  onSummarizeManifesto,
  currentUser,
  onOpenAuth
}) => {
  const [selectedCandidateId, setSelectedCandidateId] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null);

  const activeElections = elections.filter(e => e.status === 'ACTIVE');

  const handleSelect = (electionId: string, candidateId: string) => {
    setSelectedCandidateId(prev => ({ ...prev, [electionId]: candidateId }));
  };

  const handleCastVote = async (electionId: string) => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }

    const candidateId = selectedCandidateId[electionId];
    if (!candidateId) return;

    setIsSubmitting(electionId);
    try {
      await onVote(electionId, candidateId);
    } finally {
      setIsSubmitting(null);
    }
  };

  return (
    <div id="electionsSection" className="max-w-4xl mx-auto px-4 sm:px-6 mb-24">
      
      {/* Outer Rounded Container: bg-[#12131a] with subtle border #27272a */}
      <div className="rounded-3xl bg-[#12131a] border border-[#27272a] p-6 sm:p-8 shadow-2xl">
        
        {/* Card Header: Icon + Title "Open Elections" */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-5 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-950/80 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Vote className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">Open Elections</h2>
              <p className="text-xs text-zinc-400">Verified official ballots for student representation</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>LIVE SESSION</span>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="py-16 text-center text-zinc-400 font-mono text-sm">
            <div className="inline-block w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3" />
            <p>Syncing verified election ledger...</p>
          </div>
        )}

        {/* Empty State Box: bg-[#181926], bordered */}
        {!isLoading && activeElections.length === 0 && (
          <div className="rounded-2xl bg-[#181926] border border-zinc-800/90 p-8 sm:p-12 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center text-zinc-400 mb-4 border border-zinc-800">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-zinc-200 mb-2">No election is open right now.</h3>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-md">
              It will appear here once voting opens. Check back when your class teacher or election proctor begins the session.
            </p>
          </div>
        )}

        {/* Active Elections Feed */}
        {!isLoading && activeElections.length > 0 && (
          <div className="space-y-8">
            {activeElections.map(election => (
              <div key={election.id} className="space-y-5">
                


                {/* Has Voted Confirmation Banner */}
                {election.hasVoted ? (
                  <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 flex items-center gap-3 text-emerald-300 text-sm font-medium">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span>Your ballot has already been cast and sealed for this election. Thank you for voting!</span>
                  </div>
                ) : (
                  <>
                    {/* Candidate Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {election.candidates.map(candidate => {
                        const isSelected = selectedCandidateId[election.id] === candidate.id;

                        return (
                          <div
                            key={candidate.id}
                            onClick={() => handleSelect(election.id, candidate.id)}
                            className={`group relative rounded-2xl p-5 cursor-pointer transition-all duration-200 flex flex-col justify-between border ${
                              isSelected
                                ? 'bg-indigo-950/40 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.25)]'
                                : 'bg-[#181926] hover:bg-[#1f2030] border-zinc-800/80 hover:border-zinc-700'
                            }`}
                          >
                            <div>
                              {/* Avatar & Radio Indicator */}
                              <div className="flex items-center justify-between mb-4">
                                <img
                                  src={candidate.avatarUrl}
                                  alt={candidate.fullName}
                                  className="w-14 h-14 rounded-2xl object-cover border-2 border-indigo-400/40 shadow-md"
                                />
                                <div
                                  className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
                                    isSelected
                                      ? 'bg-indigo-600 border-indigo-400 text-white'
                                      : 'border-zinc-700 bg-zinc-900'
                                  }`}
                                >
                                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                </div>
                              </div>

                              {/* Candidate Info */}
                              <h4 className="text-base font-bold text-white group-hover:text-indigo-200 transition-colors">
                                {candidate.fullName}
                              </h4>
                              <p className="text-[11px] font-mono text-indigo-400 mb-2.5">{candidate.studentId}</p>

                              {/* Slogan */}
                              <p className="text-xs text-zinc-300 italic mb-4 line-clamp-2">
                                "{candidate.slogan}"
                              </p>
                            </div>

                            {/* Action: AI Manifesto Summarizer Button */}
                            <div className="pt-3 border-t border-zinc-800/80">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSummarizeManifesto(candidate);
                                }}
                                className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700 text-purple-300 hover:text-purple-200 text-xs font-semibold transition-all"
                              >
                                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                                <span>AI Manifesto</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Vote Submit CTA Bar */}
                    <div className="flex items-center justify-between pt-2">
                      <p className="text-xs text-zinc-400">
                        {selectedCandidateId[election.id]
                          ? `Ready to submit ballot for: ${
                              election.candidates.find(c => c.id === selectedCandidateId[election.id])?.fullName
                            }`
                          : 'Select a candidate card above to cast your ballot.'}
                      </p>

                      <button
                        onClick={() => handleCastVote(election.id)}
                        disabled={!selectedCandidateId[election.id] || isSubmitting === election.id}
                        className="flex items-center gap-2 px-7 py-3 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-zinc-800 disabled:to-zinc-800 disabled:text-zinc-600 text-white font-bold text-sm shadow-lg disabled:cursor-not-allowed transition-all"
                      >
                        {isSubmitting === election.id ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Sealing Ballot...</span>
                          </>
                        ) : (
                          <>
                            <Vote className="w-4 h-4" />
                            <span>{currentUser ? 'Submit Official Vote' : 'Sign in to Vote'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </>
                )}

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
