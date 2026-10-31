import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldAlert, 
  Lock, 
  KeyRound, 
  Eye, 
  Search, 
  RefreshCw, 
  Users, 
  Award, 
  Database,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  onOpenAuth?: () => void;
  onLoginSuccess?: (user: any, token: string) => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onOpenAuth,
  onLoginSuccess
}) => {
  const [activeTab, setActiveTab] = useState<'audit' | 'users' | 'candidates'>('audit');
  const [auditData, setAuditData] = useState<any[]>([]);
  const [dbRegistry, setDbRegistry] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  // In-modal Admin authentication state
  const [adminIdInput, setAdminIdInput] = useState('ADMIN-001');
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const isAdmin = currentUser && currentUser.role === 'ADMIN';

  const handleAdminDirectLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!adminPasswordInput) {
      setAuthError('Please enter your secret master password.');
      return;
    }
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: adminIdInput || 'ADMIN-001',
          password: adminPasswordInput
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid Admin Credentials');
      }
      localStorage.setItem('dvm_token', data.token);
      localStorage.setItem('dvm_user', JSON.stringify(data.user));
      if (onLoginSuccess) {
        onLoginSuccess(data.user, data.token);
      }
      setAdminPasswordInput('');
    } catch (err: any) {
      setAuthError(err.message || 'Access Denied: Invalid Master Password');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const fetchAdminData = async () => {
    if (!isAdmin) return;
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('dvm_token');
      
      // 1. Fetch Confidential Vote Audit (Who voted for whom)
      const auditRes = await fetch('/api/elections/admin/vote-audit', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (auditRes.ok) {
        const data = await auditRes.json();
        setAuditData(data.auditTrail || []);
      } else {
        setError('ACCESS_DENIED');
      }

      // 2. Fetch full database registry
      const dbRes = await fetch('/api/elections/database/all');
      if (dbRes.ok) {
        const data = await dbRes.json();
        setDbRegistry(data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load admin audit records');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setAdminPasswordInput('');
      setAuthError(null);
      fetchAdminData();
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const usersList = dbRegistry?.users || [];
  const candidatesList = dbRegistry?.candidates || [];
  const stats = dbRegistry?.stats || {
    totalRegisteredUsers: usersList.length,
    totalBallotsCast: auditData.length,
    totalCandidates: candidatesList.length,
    totalElectedMembers: 1
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-4xl bg-[#0c0d14] border border-rose-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-[#1e1f2f] bg-[#121018] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-purple-600 flex items-center justify-center shadow-lg shadow-rose-500/20 text-white">
              <ShieldAlert className="w-5 h-5 text-rose-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-wide">
                  Master Election Officer Admin Portal
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950 border border-rose-500/50 text-rose-300">
                  ADMIN ONLY
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Authorized Personnel: <span className="font-semibold text-rose-300">{currentUser?.fullName || 'Guest / Locked'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && (
              <button
                onClick={fetchAdminData}
                disabled={isLoading}
                title="Refresh audit ledger"
                className="p-2 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* LOCKED STATE: IN-PLACE ADMIN AUTHENTICATION */}
        {!isAdmin ? (
          <div className="p-8 sm:p-10 flex flex-col items-center justify-center text-center space-y-5 my-auto max-w-lg mx-auto w-full">
            <div className="w-14 h-14 rounded-2xl bg-rose-950/70 border border-rose-500/50 flex items-center justify-center text-rose-400 shadow-[0_0_25px_rgba(244,63,94,0.3)]">
              <Lock className="w-7 h-7" />
            </div>
            
            <div>
              <span className="inline-block px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-rose-950/90 border border-rose-500/40 text-rose-300 mb-1.5">
                RESTRICTED • ADMIN-001 PORTAL
              </span>
              <h4 className="text-lg font-bold text-white">Election Officer Authorization</h4>
              <p className="text-xs text-zinc-400 mt-1">
                Enter your administrative credentials to unlock the confidential ledger.
              </p>
            </div>

            {authError && (
              <div className="w-full p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs text-left">
                {authError}
              </div>
            )}

            <form
              onSubmit={handleAdminDirectLogin}
              autoComplete="off"
              data-lpignore="true"
              data-form-type="other"
              className="w-full space-y-3.5 text-left"
            >
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Admin ID</label>
                <input
                  type="text"
                  required
                  value={adminIdInput}
                  onChange={e => setAdminIdInput(e.target.value)}
                  autoComplete="off"
                  data-lpignore="true"
                  className="w-full bg-[#141522] border border-rose-500/40 focus:border-rose-400 rounded-xl px-4 py-2.5 text-xs text-rose-200 font-mono font-bold outline-none shadow-inner"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Master Password</label>
                <input
                  type="password"
                  required
                  value={adminPasswordInput}
                  onChange={e => setAdminPasswordInput(e.target.value)}
                  autoComplete="new-password"
                  data-lpignore="true"
                  placeholder="Enter Master Password"
                  className="w-full bg-[#141522] border border-zinc-700 focus:border-rose-400 rounded-xl px-4 py-2.5 text-xs text-white outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isAuthenticating}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-600 via-rose-500 to-purple-600 hover:scale-[1.02] text-white text-xs font-bold shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>{isAuthenticating ? 'Decrypting Vault...' : 'Unlock Admin Portal'}</span>
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* UNLOCKED ADMIN PANEL */
          <>
            {/* Top Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-[#08090f] border-b border-[#1e1f2f]">
              <div className="p-3 rounded-xl bg-[#12131e] border border-zinc-800 text-center">
                <span className="text-[10px] uppercase font-bold text-zinc-400">Total Registered</span>
                <p className="text-xl font-black text-white font-mono mt-0.5">{stats.totalRegisteredUsers || usersList.length}</p>
              </div>
              <div className="p-3 rounded-xl bg-[#12131e] border border-zinc-800 text-center">
                <span className="text-[10px] uppercase font-bold text-zinc-400">Ballots Cast</span>
                <p className="text-xl font-black text-emerald-400 font-mono mt-0.5">{auditData.length}</p>
              </div>
              <div className="p-3 rounded-xl bg-[#12131e] border border-zinc-800 text-center">
                <span className="text-[10px] uppercase font-bold text-zinc-400">Active Candidates</span>
                <p className="text-xl font-black text-purple-400 font-mono mt-0.5">{candidatesList.length}</p>
              </div>
              <div className="p-3 rounded-xl bg-[#12131e] border border-zinc-800 text-center">
                <span className="text-[10px] uppercase font-bold text-zinc-400">Turnout %</span>
                <p className="text-xl font-black text-cyan-400 font-mono mt-0.5">
                  {usersList.length > 0 ? Math.round((auditData.length / usersList.length) * 100) : 0}%
                </p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-[#1e1f2f] bg-[#090a10] px-6 gap-2">
              <button
                onClick={() => setActiveTab('audit')}
                className={`py-3 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'audit'
                    ? 'border-rose-500 text-rose-400 bg-rose-500/10'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Eye className="w-4 h-4 text-rose-400" />
                <span>Confidential Vote Audit</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-rose-950/80 border border-rose-500/50 text-rose-300">
                  {auditData.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('users')}
                className={`py-3 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'users'
                    ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Users className="w-4 h-4 text-indigo-400" />
                <span>Users & Roles Registry</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-indigo-950/80 border border-indigo-500/50 text-indigo-300">
                  {usersList.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('candidates')}
                className={`py-3 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'candidates'
                    ? 'border-purple-500 text-purple-400 bg-purple-500/10'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Award className="w-4 h-4 text-purple-400" />
                <span>Candidates List</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-purple-950/80 border border-purple-500/50 text-purple-300">
                  {candidatesList.length}
                </span>
              </button>
            </div>

            {/* Content Area */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1 text-sm">
              
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Filter records by student name, roll number, or email..."
                  className="w-full bg-[#12131e] border border-[#232438] focus:border-rose-500/60 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 outline-none"
                />
              </div>

              {/* TAB 1: CONFIDENTIAL VOTE AUDIT (WHO VOTED FOR WHOM) */}
              {activeTab === 'audit' && (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/30 text-xs text-rose-300 flex items-center justify-between">
                    <span>⚠️ <strong>Confidential Audit Ledger:</strong> Shows student identity mapped to their cast ballot choice. Only accessible by authorized Election Officers.</span>
                    <span className="font-mono text-zinc-400">{auditData.length} records</span>
                  </div>

                  {auditData.length === 0 ? (
                    <div className="py-12 text-center text-zinc-500 text-xs bg-[#12131e] rounded-xl border border-zinc-800">
                      No ballots have been recorded yet.
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-rose-500/20 bg-[#0e1017]">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#141522] text-zinc-400 font-semibold border-b border-[#232438]">
                          <tr>
                            <th className="py-2.5 px-3">Voter Name</th>
                            <th className="py-2.5 px-3">Student Roll</th>
                            <th className="py-2.5 px-3">Candidate Voted For</th>
                            <th className="py-2.5 px-3">Receipt Code</th>
                            <th className="py-2.5 px-3">Device / Phone</th>
                            <th className="py-2.5 px-3">Time</th>
                            <th className="py-2.5 px-3 text-right">Audit</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1e1f2f] text-zinc-300">
                          {auditData.filter((item: any) => {
                            if (!searchTerm) return true;
                            const s = searchTerm.toLowerCase();
                            return (
                              item.studentName?.toLowerCase().includes(s) ||
                              item.studentId?.toLowerCase().includes(s) ||
                              item.candidateName?.toLowerCase().includes(s) ||
                              item.receiptHash?.toLowerCase().includes(s)
                            );
                          }).map((item: any) => (
                            <tr key={item.id} className="hover:bg-rose-500/5 transition-colors font-mono">
                              <td className="py-2.5 px-3 text-white font-sans font-medium flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-[10px] text-rose-300 font-bold shrink-0">
                                  {item.studentName?.charAt(0) || 'S'}
                                </div>
                                <span>{item.studentName}</span>
                              </td>
                              <td className="py-2.5 px-3 text-cyan-300">{item.studentId}</td>
                              <td className="py-2.5 px-3 font-sans font-bold text-amber-300">
                                {item.candidateName}
                              </td>
                              <td className="py-2.5 px-3 text-emerald-400 font-mono font-bold">
                                {item.receiptHash}
                              </td>
                              <td className="py-2.5 px-3 text-zinc-400 text-[10px] truncate max-w-[100px]">
                                {item.deviceId || 'Mobile/Browser'}
                              </td>
                              <td className="py-2.5 px-3 text-zinc-400 text-[10px] whitespace-nowrap">
                                {new Date(item.votedAt).toLocaleTimeString()}
                              </td>
                              <td className="py-2.5 px-3 text-right">
                                <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[9px] font-sans font-bold border border-rose-500/30">
                                  AUDITED
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

              {/* TAB 2: REGISTERED USERS DIRECTORY */}
              {activeTab === 'users' && (
                <div className="overflow-x-auto rounded-xl border border-indigo-500/20 bg-[#0e1017]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#141522] text-zinc-400 font-semibold border-b border-[#232438]">
                      <tr>
                        <th className="py-2.5 px-3">Student ID</th>
                        <th className="py-2.5 px-3">Full Name</th>
                        <th className="py-2.5 px-3">Role</th>
                        <th className="py-2.5 px-3">Class</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1e1f2f] text-zinc-300">
                      {usersList.filter((u: any) => {
                        if (!searchTerm) return true;
                        const s = searchTerm.toLowerCase();
                        return (
                          u.fullName?.toLowerCase().includes(s) ||
                          u.studentId?.toLowerCase().includes(s) ||
                          u.role?.toLowerCase().includes(s)
                        );
                      }).map((u: any) => (
                        <tr key={u.id} className="hover:bg-indigo-500/5 transition-colors">
                          <td className="py-2.5 px-3 font-mono text-cyan-300 font-semibold">{u.studentId}</td>
                          <td className="py-2.5 px-3 font-medium text-white">{u.fullName}</td>
                          <td className="py-2.5 px-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              u.role === 'ADMIN' 
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                                : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-zinc-400">{u.className || 'Grade 10-A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* TAB 3: CANDIDATES */}
              {activeTab === 'candidates' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {candidatesList.map((c: any) => (
                    <div key={c.id} className="p-3 rounded-xl bg-[#141522] border border-[#232438] flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img src={c.avatarUrl} alt={c.fullName} className="w-10 h-10 rounded-xl object-cover border border-zinc-700" />
                        <div>
                          <div className="font-bold text-white text-xs">{c.fullName}</div>
                          <div className="text-[10px] text-zinc-400 font-mono">{c.studentId}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-emerald-400 font-mono">{c.voteCount}</span>
                        <span className="text-[10px] text-zinc-400 ml-1">votes</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          </>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-[#1e1f2f] bg-[#090a10] flex justify-between items-center text-xs text-zinc-500 font-mono">
          <span>DVM Secure Admin Node • Ed-Tech v2.4</span>
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

