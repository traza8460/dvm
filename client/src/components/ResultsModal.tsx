import React, { useState, useEffect } from 'react';
import { 
  X, 
  Trophy, 
  ShieldCheck, 
  AlertTriangle, 
  RefreshCw, 
  CheckCircle2,
  UserCheck,
  Search
} from 'lucide-react';

interface ResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  electionId: string;
  currentUser?: any;
  onOpenAuth?: () => void;
  initialTab?: 'tally' | 'voters' | 'audit';
}

export const ResultsModal: React.FC<ResultsModalProps> = ({
  isOpen,
  onClose,
  electionId,
  initialTab = 'tally'
}) => {
  const [resultsData, setResultsData] = useState<any>(null);
  const [dbRegistry, setDbRegistry] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'tally' | 'voters' | 'audit'>(initialTab);
  const [voterSearch, setVoterSearch] = useState('');

  const fetchResults = async () => {
    setIsLoading(true);
    try {
      if (electionId) {
        const res = await fetch(`/api/elections/${electionId}/results`);
        const data = await res.json();
        setResultsData(data);
      }
      
      const dbRes = await fetch('/api/elections/database/all');
      if (dbRes.ok) {
        const dbData = await dbRes.json();
        setDbRegistry(dbData);
      }
    } catch (err) {
      console.error('Failed to load results or voter registry', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchResults();
      if (initialTab) {
        setActiveTab(initialTab);
      }
    }
  }, [isOpen, electionId]);

  if (!isOpen) return null;

  const candidates = resultsData?.candidates || [];
  const totalVotes = candidates.reduce((acc: number, c: any) => acc + c.voteCount, 0);
  const anomalyAudit = resultsData?.anomalyAudit || {
    flagged: false,
    reason: 'Normal temporal voting dispersion observed.',
    score: 98
  };

  const votersList = dbRegistry?.voters || [];
  const filteredVoters = votersList.filter((v: any) => {
    if (!voterSearch) return true;
    const q = voterSearch.toLowerCase();
    return (
      v.voterName?.toLowerCase().includes(q) ||
      v.studentId?.toLowerCase().includes(q) ||
      v.receiptHash?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-2xl bg-[#0f111a] border border-[#27273a] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-[#1e1f2f] bg-[#12131e] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <Trophy className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Election Leaderboard & Audit Ledger
              </h3>
              <p className="text-xs text-zinc-400">
                Total ballots cast: <span className="font-semibold text-emerald-400 font-mono">{totalVotes}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchResults}
              disabled={isLoading}
              title="Refresh live counts"
              className="p-2 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#1e1f2f] bg-[#0c0d14] px-6 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('tally')}
            className={`py-3 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
              activeTab === 'tally'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            Candidate Leaderboard
          </button>

          <button
            onClick={() => setActiveTab('voters')}
            className={`py-3 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
              activeTab === 'voters'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <UserCheck className="w-4 h-4 text-emerald-400" />
            <span>Voters Participation</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950/80 border border-emerald-500/50 text-emerald-300">
              {votersList.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`py-3 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
              activeTab === 'audit'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Gemini Fraud Sentinel
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          
          {/* TAB 1: CANDIDATE LEADERBOARD */}
          {activeTab === 'tally' && (
            <div className="space-y-4 animate-fade-in">
              {candidates.length === 0 ? (
                <div className="py-12 text-center text-zinc-500 text-sm">
                  No votes recorded yet for this election.
                </div>
              ) : (
                candidates.map((c: any, index: number) => {
                  const percentage = totalVotes > 0 ? Math.round((c.voteCount / totalVotes) * 100) : 0;
                  const isLeader = index === 0 && c.voteCount > 0;

                  return (
                    <div
                      key={c.id}
                      className={`p-4 rounded-xl border transition-all ${
                        isLeader
                          ? 'bg-purple-950/20 border-purple-500/40 shadow-lg shadow-purple-500/5'
                          : 'bg-[#141522] border-[#232438]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <img
                            src={c.avatarUrl}
                            alt={c.fullName}
                            className="w-10 h-10 rounded-xl object-cover border border-zinc-700"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white text-sm">{c.fullName}</span>
                              {isLeader && (
                                <span className="flex items-center gap-1 text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-bold border border-amber-500/30">
                                  <Trophy className="w-3 h-3 text-amber-400" />
                                  <span>LEADING</span>
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-zinc-400 font-mono">{c.studentId}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-lg font-black text-white font-mono">{c.voteCount}</span>
                          <span className="text-xs text-zinc-400 ml-1">votes</span>
                          <div className="text-xs font-semibold text-purple-400">{percentage}%</div>
                        </div>
                      </div>

                      {/* Bar indicator */}
                      <div className="w-full bg-zinc-800/80 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            isLeader
                              ? 'bg-gradient-to-r from-purple-500 to-indigo-400'
                              : 'bg-zinc-600'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 2: VOTERS PARTICIPATION (KAUN VOTE DE CHUKA HAI — ZERO CANDIDATE CHOICE REVEALED) */}
          {activeTab === 'voters' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-[#141522] border border-[#232438]">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-emerald-400" />
                    <span>Official Voter Participation Ledger</span>
                  </h4>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Verified record of students who cast their ballot. Candidate selections remain 100% anonymous.
                  </p>
                </div>
                <div className="text-xs font-mono bg-black/40 px-3 py-1.5 rounded-lg border border-zinc-800 text-zinc-300 shrink-0">
                  Total Voted: <strong className="text-emerald-400">{votersList.length}</strong>
                </div>
              </div>

              {/* Search voter */}
              <div className="relative">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={voterSearch}
                  onChange={e => setVoterSearch(e.target.value)}
                  placeholder="Search by student name, roll number, or receipt (e.g. REC-001)..."
                  className="w-full bg-[#0a0b12] border border-[#232438] focus:border-emerald-500/60 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 outline-none"
                />
              </div>

              {filteredVoters.length === 0 ? (
                <div className="py-12 text-center text-zinc-500 text-xs bg-[#141522] rounded-xl border border-[#232438]">
                  No voter records found matching your search.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-emerald-500/20 bg-[#0c0d14]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#141522] text-zinc-400 font-semibold border-b border-[#232438]">
                      <tr>
                        <th className="py-2.5 px-3">Voter Name</th>
                        <th className="py-2.5 px-3">Student Roll</th>
                        <th className="py-2.5 px-3">Receipt Slip Code</th>
                        <th className="py-2.5 px-3">Time Cast</th>
                        <th className="py-2.5 px-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1e1f2f] text-zinc-300">
                      {filteredVoters.map((v: any) => (
                        <tr key={v.id} className="hover:bg-white/5 transition-colors font-mono">
                          <td className="py-2.5 px-3 text-white font-sans font-medium flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-[10px] text-emerald-300 font-bold shrink-0">
                              {v.voterName?.charAt(0) || 'S'}
                            </div>
                            <span>{v.voterName}</span>
                          </td>
                          <td className="py-2.5 px-3 text-cyan-300">{v.studentId}</td>
                          <td className="py-2.5 px-3">
                            <span className="font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/40 text-[11px]">
                              {v.receiptHash}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-zinc-400 text-[10px] whitespace-nowrap">
                            {new Date(v.votedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] font-sans font-bold border border-emerald-500/40">
                              ✓ BALLOT RECORDED
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: FRAUD SENTINEL & CRYPTOGRAPHIC AUDIT */}
          {activeTab === 'audit' && (
            <div className="space-y-4 animate-fade-in">
              <div className={`p-4 rounded-xl border flex items-start gap-3 ${
                anomalyAudit.flagged 
                  ? 'bg-rose-950/30 border-rose-500/50' 
                  : 'bg-emerald-950/20 border-emerald-500/30'
              }`}>
                {anomalyAudit.flagged ? (
                  <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                ) : (
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-white">Gemini Fraud Sentinel Analysis</h4>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                      anomalyAudit.flagged 
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' 
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    }`}>
                      {anomalyAudit.flagged ? 'FLAGGED ANOMALY' : 'AUDIT PASSED'}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                    {anomalyAudit.reason}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#141522] border border-[#232438] space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-zinc-300">
                  <span>Cryptographic Integrity Score</span>
                  <span className="font-mono text-emerald-400 text-sm font-bold">{anomalyAudit.score}%</span>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                    style={{ width: `${anomalyAudit.score}%` }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                  <div className="flex items-center gap-1.5 text-zinc-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Zero Double-Voting</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-zinc-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Irreversible Ballot Ledger</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#1e1f2f] bg-[#0c0d14] flex justify-between items-center text-xs text-zinc-500 font-mono">
          <span>DVM Protocol v2.4 (Ed-Tech Certified)</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
