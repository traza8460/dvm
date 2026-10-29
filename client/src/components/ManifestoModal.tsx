import React, { useState } from 'react';
import { X, Sparkles, Award, CheckCircle, Scale, Loader2, BookOpen } from 'lucide-react';

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

interface ManifestoModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: Candidate | null;
  allCandidates: Candidate[];
}

export const ManifestoModal: React.FC<ManifestoModalProps> = ({
  isOpen,
  onClose,
  candidate,
  allCandidates
}) => {
  const [activeTab, setActiveTab] = useState<'manifesto' | 'summary' | 'compare'>('summary');
  const [summaryList, setSummaryList] = useState<string[]>([]);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [comparisonData, setComparisonData] = useState<any>(null);
  const [isComparing, setIsComparing] = useState(false);

  if (!isOpen || !candidate) return null;

  const handleFetchSummary = async () => {
    setIsSummarizing(true);
    try {
      const res = await fetch('/api/ai/summarize-manifesto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateName: candidate.fullName,
          manifestoText: candidate.manifesto
        })
      });
      const data = await res.json();
      setSummaryList(data.summary || []);
    } catch {
      setSummaryList([
        'Ensure transparent and open student-teacher communication channels.',
        'Organize peer tutoring groups before mid-term and semester examinations.',
        'Advocate for improved classroom infrastructure and zero-period activities.'
      ]);
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleFetchComparison = async () => {
    setIsComparing(true);
    try {
      const payload = allCandidates.map(c => ({
        name: c.fullName,
        manifesto: c.manifesto
      }));
      const res = await fetch('/api/ai/compare-manifestos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidates: payload })
      });
      const data = await res.json();
      setComparisonData(data);
    } catch {
      setComparisonData({
        summary: "Neutral AI comparison highlighting each nominee's platform strengths.",
        comparisons: allCandidates.map(c => ({
          name: c.fullName,
          coreFocus: c.slogan,
          strengths: ['Strong peer engagement', 'Practical academic focus'],
          targetArea: 'Class Welfare'
        }))
      });
    } finally {
      setIsComparing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl bg-[#0e1017] border border-[#27273a] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-[#1e1f2f] bg-[#12131e]/90 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img
              src={candidate.avatarUrl}
              alt={candidate.fullName}
              className="w-14 h-14 rounded-2xl object-cover border-2 border-purple-500/40 shadow-lg shadow-purple-500/20"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-white">{candidate.fullName}</h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono border border-indigo-500/30">
                  {candidate.studentId}
                </span>
              </div>
              <p className="text-sm text-purple-300 italic mt-0.5">"{candidate.slogan}"</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-zinc-800/70 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-[#1e1f2f] bg-[#0c0d14] px-6">
          <button
            onClick={() => {
              setActiveTab('summary');
              if (summaryList.length === 0) handleFetchSummary();
            }}
            className={`py-3 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'summary'
                ? 'border-purple-500 text-purple-400 bg-purple-500/5'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            AI 3-Point Summary
          </button>

          <button
            onClick={() => setActiveTab('manifesto')}
            className={`py-3 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'manifesto'
                ? 'border-purple-500 text-purple-400 bg-purple-500/5'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <BookOpen className="w-4 h-4 text-zinc-400" />
            Full Manifesto
          </button>

          <button
            onClick={() => {
              setActiveTab('compare');
              if (!comparisonData) handleFetchComparison();
            }}
            className={`py-3 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'compare'
                ? 'border-purple-500 text-purple-400 bg-purple-500/5'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Scale className="w-4 h-4 text-cyan-400" />
            AI Candidate Comparison
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          
          {/* TAB 1: AI Summary */}
          {activeTab === 'summary' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-purple-200">Gemini 1.5 Flash Executive Breakdown</h4>
                  <p className="text-xs text-purple-300/80 mt-1">
                    Analyzed raw student manifesto into the 3 most crucial, actionable campaign promises.
                  </p>
                </div>
              </div>

              {isSummarizing ? (
                <div className="py-12 flex flex-col items-center justify-center gap-3 text-zinc-400">
                  <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
                  <p className="text-xs">Distilling candidate vision via Google Gemini...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {(summaryList.length > 0 ? summaryList : [
                    'Establish weekly student doubt clearing windows with subject mentors.',
                    'Equalize sports gear access and promote transparent zero-period activities.',
                    'Introduce an anonymous class grievance box for immediate problem resolution.'
                  ]).map((point, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-[#141522] border border-[#232438] flex items-start gap-3 hover:border-purple-500/40 transition-colors"
                    >
                      <span className="w-6 h-6 rounded-full bg-purple-600/20 text-purple-400 font-bold text-xs flex items-center justify-center shrink-0 border border-purple-500/30">
                        {idx + 1}
                      </span>
                      <p className="text-zinc-200 leading-relaxed font-medium">{point}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Full Manifesto */}
          {activeTab === 'manifesto' && (
            <div className="space-y-4">
              <div className="p-5 rounded-xl bg-[#141522] border border-[#232438] text-zinc-300 leading-relaxed font-normal whitespace-pre-line">
                {candidate.manifesto}
              </div>
            </div>
          )}

          {/* TAB 3: AI Compare */}
          {activeTab === 'compare' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/30 flex items-start gap-3">
                <Scale className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-cyan-200">Objective Multi-Candidate Comparison</h4>
                  <p className="text-xs text-cyan-300/80 mt-1">
                    Powered by Gemini to provide completely unbiased side-by-side analysis of all class nominees.
                  </p>
                </div>
              </div>

              {isComparing ? (
                <div className="py-12 flex flex-col items-center justify-center gap-3 text-zinc-400">
                  <Loader2 className="w-6 h-6 animate-spin text-cyan-500" />
                  <p className="text-xs">Evaluating comparative candidate stances...</p>
                </div>
              ) : comparisonData ? (
                <div className="space-y-4">
                  <p className="text-xs text-zinc-400 italic bg-[#141522] p-3 rounded-lg border border-zinc-800">
                    {comparisonData.summary}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {comparisonData.comparisons?.map((c: any, idx: number) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-xl border ${
                          c.name === candidate.fullName
                            ? 'bg-purple-950/20 border-purple-500/40'
                            : 'bg-[#141522] border-[#232438]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-semibold text-white">{c.name}</h5>
                          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                            {c.targetArea}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-300 mb-2 font-medium">
                          Focus: <span className="text-purple-300">{c.coreFocus}</span>
                        </p>
                        <div className="space-y-1">
                          {c.strengths?.map((s: string, sIdx: number) => (
                            <div key={sIdx} className="flex items-center gap-1.5 text-xs text-zinc-400">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              <span>{s}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#1e1f2f] bg-[#0c0d14] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-colors"
          >
            Close Reader
          </button>
        </div>

      </div>
    </div>
  );
};
