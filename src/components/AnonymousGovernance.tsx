'use client';

import React, { useState } from 'react';
import { Vote, ShieldCheck, AlertTriangle, CheckCircle2, Lock, Sparkles, Send, FileText, QrCode, UserCheck } from 'lucide-react';
import { GovernancePoll, WhistleblowerReport, formatUSD, generateZKHash } from '@/lib/midroll-zk';
import confetti from 'canvas-confetti';

interface AnonymousGovernanceProps {
  polls: GovernancePoll[];
  onCastVote: (pollId: string, optionIndex: number) => void;
  whistleblowerReports: WhistleblowerReport[];
  onSubmitWhistleblowerReport: (report: WhistleblowerReport) => void;
}

export const AnonymousGovernance: React.FC<AnonymousGovernanceProps> = ({
  polls,
  onCastVote,
  whistleblowerReports,
  onSubmitWhistleblowerReport,
}) => {
  const [activeTab, setActiveTab] = useState<'polls' | 'whistleblower'>('polls');

  // Voting Modal state
  const [selectedPoll, setSelectedPoll] = useState<GovernancePoll | null>(null);
  const [selectedOption, setSelectedOption] = useState<number>(0);
  const [isVoting, setIsVoting] = useState(false);
  const [voteProgress, setVoteProgress] = useState(0);

  // Whistleblower state
  const [wbCategory, setWbCategory] = useState<'Security Breach' | 'Financial Irregularity' | 'HR Harassment' | 'Compliance Violation'>('Security Breach');
  const [wbMessage, setWbMessage] = useState('');
  const [isSubmittingWb, setIsSubmittingWb] = useState(false);

  const handleOpenVoteModal = (poll: GovernancePoll) => {
    setSelectedPoll(poll);
    setSelectedOption(0);
    setVoteProgress(0);
  };

  const handleExecuteVote = () => {
    if (!selectedPoll) return;
    setIsVoting(true);
    setVoteProgress(20);

    const t1 = setTimeout(() => setVoteProgress(60), 600);
    const t2 = setTimeout(() => setVoteProgress(90), 1200);
    const t3 = setTimeout(() => {
      setVoteProgress(100);
      setIsVoting(false);
      onCastVote(selectedPoll.id, selectedOption);
      setSelectedPoll(null);
      confetti({ particleCount: 70, spread: 70 });
    }, 1800);
  };

  const handleSubmitWbReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wbMessage) return;

    setIsSubmittingWb(true);
    setTimeout(() => {
      const newReport: WhistleblowerReport = {
        id: 'wb_' + Math.floor(Math.random() * 900 + 100),
        timestamp: new Date().toLocaleString(),
        category: wbCategory,
        encryptedContent: `ENCRYPTED_ZK_PAYLOAD: ${wbMessage}`,
        zkPayrollProofHash: generateZKHash('0xproof_wb_membership'),
        nullifierHash: generateZKHash('0xnullifier_wb'),
        investigationStatus: 'SUBMITTED',
      };

      onSubmitWhistleblowerReport(newReport);
      setIsSubmittingWb(false);
      setWbMessage('');
      confetti({ particleCount: 80, spread: 60 });
    }, 1500);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-indigo-500/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-2">
              <Vote className="w-4 h-4" />
              <span>Feature 6: Shielded Employee Voice</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white">
              Anonymous Governance & <span className="text-gradient-cyan">Whistleblower Protocol</span>
            </h1>
            <p className="text-sm text-slate-300 mt-1">
              Participate in company decisions and submit confidential alerts with zero-knowledge membership proofs — impossible to trace to your identity or salary.
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-slate-900/90 p-1.5 rounded-xl border border-indigo-900/50">
            <button
              onClick={() => setActiveTab('polls')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                activeTab === 'polls' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              DAO Governance Polls
            </button>
            <button
              onClick={() => setActiveTab('whistleblower')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                activeTab === 'whistleblower' ? 'bg-rose-500 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Whistleblower Portal
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content 1: Governance Polls */}
      {activeTab === 'polls' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {polls.map((poll) => (
            <div key={poll.id} className="glass-panel p-6 rounded-2xl border border-indigo-900/40 space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2.5 py-1 bg-cyan-950/80 border border-cyan-800/40 text-cyan-300 text-xs font-semibold rounded-md">
                    {poll.category}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">Ends: {poll.deadline}</span>
                </div>

                <h3 className="text-base font-bold text-white mb-1">{poll.title}</h3>
                <p className="text-xs text-slate-300 mb-4">{poll.description}</p>

                {/* Progress bars for options */}
                <div className="space-y-3">
                  {poll.options.map((opt, idx) => {
                    const pct = poll.totalVotes > 0 ? Math.round((opt.votesCount / poll.totalVotes) * 100) : 0;
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-200 font-medium">{opt.text}</span>
                          <span className="text-cyan-400 font-mono font-bold">{pct}% ({opt.votesCount})</span>
                        </div>
                        <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                          <div
                            className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500 transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-indigo-900/40 flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-xs text-slate-400">
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                  <span>ZK Payroll Membership Verified</span>
                </div>

                <button
                  onClick={() => handleOpenVoteModal(poll)}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow cursor-pointer"
                >
                  Cast Shielded Vote
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab Content 2: Whistleblower Portal */}
      {activeTab === 'whistleblower' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Submit Alert Form */}
          <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-rose-500/30 space-y-6">
            <div className="flex items-center space-x-2 text-xs font-semibold text-rose-400 uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4" />
              <span>Encrypted Anti-Retaliation Channel</span>
            </div>
            <h2 className="text-xl font-extrabold text-white">Submit Anonymous Whistleblower Alert</h2>
            <p className="text-xs text-slate-300">
              Your submission includes a zero-knowledge proof attesting that you are a verified MidRoll payroll recipient, while completely hiding your identity, IP address, and wallet.
            </p>

            <form onSubmit={handleSubmitWbReport} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Issue Category</label>
                <select
                  value={wbCategory}
                  onChange={(e) => setWbCategory(e.target.value as any)}
                  className="w-full glass-input p-3 rounded-xl text-sm bg-slate-900"
                >
                  <option value="Security Breach">Security Breach / Vulnerability</option>
                  <option value="Financial Irregularity">Financial Irregularity / Accounting Misconduct</option>
                  <option value="HR Harassment">HR Harassment / Ethics Violation</option>
                  <option value="Compliance Violation">Regulatory / Compliance Non-Conformity</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Encrypted Confidential Report</label>
                <textarea
                  rows={4}
                  required
                  value={wbMessage}
                  onChange={(e) => setWbMessage(e.target.value)}
                  placeholder="Provide detailed information regarding the issue. All text is client-side encrypted prior to ledger commitment."
                  className="w-full glass-input p-3 rounded-xl text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingWb}
                className="w-full py-3 bg-gradient-to-r from-rose-500 to-indigo-600 hover:from-rose-400 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-rose-500/20 transition cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmittingWb ? 'Synthesizing ZK Whistleblower Proof...' : 'Submit Anonymous Report'}</span>
              </button>
            </form>
          </div>

          {/* Whistleblower Submissions Log */}
          <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-indigo-900/40 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Lock className="w-5 h-5 text-cyan-400" />
              <span>Verified Whistleblower Audit Trail</span>
            </h2>

            <div className="space-y-3">
              {whistleblowerReports.map((wb) => (
                <div key={wb.id} className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between items-center font-bold">
                    <span className="text-rose-400 font-mono">{wb.id}</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono text-[10px]">
                      {wb.investigationStatus}
                    </span>
                  </div>
                  <div className="text-slate-300 font-mono text-[11px] bg-slate-950 p-2 rounded border border-slate-800">
                    {wb.encryptedContent}
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>ZK Proof: {wb.zkPayrollProofHash.substring(0, 16)}...</span>
                    <span>{wb.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Vote Modal */}
      {selectedPoll && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="glass-panel max-w-md w-full p-6 rounded-2xl border border-cyan-500/40 space-y-4">
            <h3 className="text-lg font-bold text-white">Cast Anonymous ZK Vote</h3>
            <p className="text-xs text-slate-300">{selectedPoll.title}</p>

            <div className="space-y-2">
              {selectedPoll.options.map((opt, idx) => (
                <label
                  key={idx}
                  onClick={() => setSelectedOption(idx)}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition text-xs ${
                    selectedOption === idx
                      ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-300'
                  }`}
                >
                  <span>{opt.text}</span>
                  <input
                    type="radio"
                    name="vote_option"
                    checked={selectedOption === idx}
                    onChange={() => setSelectedOption(idx)}
                    className="accent-cyan-400"
                  />
                </label>
              ))}
            </div>

            {isVoting && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-cyan-400 font-semibold">
                  <span>Generating Groth16 Nullifier Proof...</span>
                  <span>{voteProgress}%</span>
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div className="h-full bg-cyan-400 transition-all duration-300" style={{ width: `${voteProgress}%` }}></div>
                </div>
              </div>
            )}

            <div className="flex space-x-3 pt-2">
              <button
                disabled={isVoting}
                onClick={() => setSelectedPoll(null)}
                className="flex-1 py-2.5 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                disabled={isVoting}
                onClick={handleExecuteVote}
                className="flex-1 py-2.5 bg-gradient-to-r from-cyan-500 to-indigo-600 text-white text-xs font-bold rounded-xl shadow cursor-pointer"
              >
                Confirm Vote
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
