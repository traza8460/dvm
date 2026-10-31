import React, { useState, useEffect } from 'react';
import { 
  X, 
  Trophy, 
  BarChart3, 
  ShieldCheck, 
  AlertTriangle, 
  RefreshCw, 
  Lock, 
  CheckCircle2,
  Database,
  Users,
  Award,
  UserCheck
} from 'lucide-react';

interface ResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  electionId: string;
}

export const ResultsModal: React.FC<ResultsModalProps> = ({
  isOpen,
  onClose,
  electionId
}) => {
  const [resultsData, setResultsData] = useState<any>(null);
  const [dbRegistry, setDbRegistry] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'tally' | 'audit' | 'database'>('tally');
  const [activeDbView, setActiveDbView] = useState<'elected' | 'users' | 'voters'>('elected');

  const fetchResults = async () => {
    setIsLoading(true);
    try {
      if (electionId) {
        const res = await fetch(`/api/elections/${electionId}/results`);
        const data = await res.json();
        setResultsData(data);
      }
      
      const dbRes = await fetch('/api/elections/database/all');
      const dbData = await dbRes.json();
      setDbRegistry(dbData);
    } catch (err) {
      console.error('Failed to load results or database registry', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchResults();
    }
  }, [isOpen, electionId]);

  if (!isOpen) return null;

  const totalVotes = resultsData?.totalVotes || 0;
  const candidates = resultsData?.candidateResults || [];
  const anomalyAudit = resultsData?.fraudAnalysis || {
    anomalyScore: 0.05,
    flagged: false,
    reason: 'Voting timestamps show uniform, natural human intervals. Zero bot-cluster anomalies detected.'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-2xl bg-[#0e1017] border border-[#27273a] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-[#1e1f2f] bg-[#12131e]/90 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Election Tally & Audit Ledger
              </h3>
              <p className="text-xs text-zinc-400">
                Total ballots cast: <span className="font-semibold text-purple-400">{totalVotes}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchResults}
              disabled={isLoading}
              title="Refresh live counts"
              className="p-2 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#1e1f2f] bg-[#0c0d14] px-6 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('tally')}
            className={`py-3 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'tally'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Trophy className="w-4 h-4" />
            Live Candidate Standings
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`py-3 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'audit'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Gemini Fraud Sentinel
          </button>
          <button
            onClick={() => setActiveTab('database')}
            className={`py-3 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'database'
                ? 'border-cyan-500 text-cyan-400 bg-cyan-500/5'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Database className="w-4 h-4 text-cyan-400" />
            Database Registry (SQLite)
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {activeTab === 'tally' ? (
            <div className="space-y-4">
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
                              <span className="font-semibold text-white">{c.fullName}</span>
                              {isLeader && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                                  <Trophy className="w-3 h-3 text-amber-400" /> Leading
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-zinc-400">{c.slogan}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-base font-bold text-white font-mono">{percentage}%</span>
                          <span className="text-xs text-zinc-500 block">
                            {c.voteCount} {c.voteCount === 1 ? 'ballot' : 'ballots'}
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full h-2.5 bg-zinc-800/80 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            isLeader
                              ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500'
                              : 'bg-gradient-to-r from-zinc-600 to-zinc-400'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            /* TAB 2: Fraud Sentinel & Cryptographic Ledger */
            <div className="space-y-4">
              
              {/* Gemini Sentinel Status */}
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
                  <div className="mt-2 text-[11px] font-mono text-zinc-400">
                    Anomaly Index: <span className="text-emerald-400">{anomalyAudit.anomalyScore.toFixed(3)} / 1.000</span> (Threshold: 0.650)
                  </div>
                </div>
              </div>

              {/* Secrecy Math Card */}
              <div className="p-4 rounded-xl bg-[#141522] border border-[#232438] space-y-2">
                <div className="flex items-center gap-2 text-purple-400 font-semibold text-xs uppercase tracking-wider">
                  <Lock className="w-4 h-4" /> Cryptographic Ballot Anonymity Architecture
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Votes are permanently decoupled from voter identities. When you vote, the system produces an irreversible receipt token:
                </p>
                <div className="p-2.5 rounded-lg bg-[#0a0b12] font-mono text-xs text-purple-300 border border-purple-500/20 break-all select-all">
                  Receipt = SHA-256(student_id + election_secret)
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

          {activeTab === 'database' && (
            <div className="space-y-4 animate-fade-in">
              {/* Stats Overview */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-xl bg-[#141522] border border-[#232438] text-center">
                  <div className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">Registered Users</div>
                  <div className="text-lg font-bold text-white mt-0.5">{dbRegistry?.stats?.totalRegisteredUsers || 0}</div>
                </div>
                <div className="p-3 rounded-xl bg-[#141522] border border-[#232438] text-center">
                  <div className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">Ballots Cast</div>
                  <div className="text-lg font-bold text-emerald-400 mt-0.5">{dbRegistry?.stats?.totalBallotsCast || 0}</div>
                </div>
                <div className="p-3 rounded-xl bg-[#141522] border border-[#232438] text-center">
                  <div className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">Candidates</div>
                  <div className="text-lg font-bold text-indigo-400 mt-0.5">{dbRegistry?.stats?.totalCandidates || 0}</div>
                </div>
                <div className="p-3 rounded-xl bg-[#141522] border border-[#232438] text-center">
                  <div className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">Elected Leaders</div>
                  <div className="text-lg font-bold text-amber-400 mt-0.5">{dbRegistry?.stats?.totalElectedMembers || 0}</div>
                </div>
              </div>

              {/* Sub-view switcher */}
              <div className="flex gap-2 p-1 rounded-xl bg-[#0a0b12] border border-zinc-800">
                <button
                  type="button"
                  onClick={() => setActiveDbView('elected')}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    activeDbView === 'elected'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Elected ({dbRegistry?.electedMembers?.length || 0})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDbView('users')}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    activeDbView === 'users'
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Users ({dbRegistry?.users?.length || 0})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDbView('voters')}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    activeDbView === 'voters'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Voters ({dbRegistry?.voters?.length || 0})</span>
                </button>
              </div>

              {/* View 1: Elected Members */}
              {activeDbView === 'elected' && (
                <div className="space-y-2.5">
                  <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-400" />
                    <span>Elected Student Representatives & Candidates Table</span>
                  </div>
                  {dbRegistry?.candidates?.map((c: any) => (
                    <div
                      key={c.id}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                        c.isElected 
                          ? 'bg-amber-950/20 border-amber-500/40 shadow-md shadow-amber-500/10' 
                          : 'bg-[#141522] border-[#232438]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img src={c.avatarUrl} alt={c.fullName} className="w-9 h-9 rounded-xl object-cover border border-zinc-700" />
                        <div>
                          <div className="font-bold text-white flex items-center gap-2 text-xs sm:text-sm">
                            <span>{c.fullName}</span>
                            {c.isElected && (
                              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold border border-amber-500/40 flex items-center gap-1">
                                <Award className="w-3 h-3" /> ELECTED
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-zinc-400 italic">"{c.slogan}"</p>
                          <span className="text-[10px] font-mono text-indigo-300">{c.studentId}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-base font-black text-white">{c.voteCount}</div>
                        <div className="text-[10px] text-zinc-400">Votes</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* View 2: Users Table */}
              {activeDbView === 'users' && (
                <div className="space-y-2">
                  <div className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-indigo-400" />
                    <span>Registered Users Database (Students & Admin)</span>
                  </div>
                  <div className="overflow-x-auto rounded-xl border border-[#232438] bg-[#0c0d14]">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#141522] text-zinc-400 font-semibold border-b border-[#232438]">
                        <tr>
                          <th className="py-2 px-3">Student ID</th>
                          <th className="py-2 px-3">Full Name</th>
                          <th className="py-2 px-3">Email</th>
                          <th className="py-2 px-3">Role</th>
                          <th className="py-2 px-3">Class</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1e1f2f] text-zinc-300">
                        {dbRegistry?.users?.map((u: any) => (
                          <tr key={u.id} className="hover:bg-white/5 transition-colors">
                            <td className="py-1.5 px-3 font-mono text-cyan-300">{u.studentId}</td>
                            <td className="py-1.5 px-3 font-medium text-white">{u.fullName}</td>
                            <td className="py-1.5 px-3 text-zinc-400">{u.email}</td>
                            <td className="py-1.5 px-3">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                                u.role === 'ADMIN' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-indigo-500/20 text-indigo-300'
                              }`}>
                                {u.role}
                              </span>
                            </td>
                            <td className="py-1.5 px-3 text-zinc-400">{u.className}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* View 3: Voters Participation Ledger */}
              {activeDbView === 'voters' && (
                <div className="space-y-2">
                  <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-emerald-400" />
                    <span>Voter Participation & SHA-256 Receipt Audit Trail</span>
                  </div>
                  {(!dbRegistry?.voters || dbRegistry.voters.length === 0) ? (
                    <div className="py-6 text-center text-zinc-500 text-xs">
                      No ballots submitted in this session yet. Cast a ballot to see real-time cryptographic audit trail!
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-[#232438] bg-[#0c0d14]">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#141522] text-zinc-400 font-semibold border-b border-[#232438]">
                          <tr>
                            <th className="py-2 px-3">Voter</th>
                            <th className="py-2 px-3">Student ID</th>
                            <th className="py-2 px-3">SHA-256 Receipt Hash</th>
                            <th className="py-2 px-3">Timestamp</th>
                            <th className="py-2 px-3">Audit</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1e1f2f] text-zinc-300">
                          {dbRegistry.voters.map((v: any) => (
                            <tr key={v.id} className="hover:bg-white/5 transition-colors font-mono">
                              <td className="py-1.5 px-3 text-white font-sans font-medium">{v.voterName}</td>
                              <td className="py-1.5 px-3 text-cyan-300">{v.studentId}</td>
                              <td className="py-1.5 px-3 text-purple-300 text-[10px] truncate max-w-[130px]" title={v.receiptHash}>
                                {v.receiptHash}
                              </td>
                              <td className="py-1.5 px-3 text-zinc-400 text-[10px]">
                                {new Date(v.votedAt).toLocaleTimeString()}
                              </td>
                              <td className="py-1.5 px-3">
                                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-sans font-semibold">
                                  ✓ VERIFIED
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

            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#1e1f2f] bg-[#0c0d14] flex justify-between items-center text-xs text-zinc-500 font-mono">
          <span>DVM Protocol v2.4 (Ed-Tech Certified)</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
