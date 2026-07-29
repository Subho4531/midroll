'use client';

import React, { useState } from 'react';
import { Vote, AlertTriangle, Lock, Send, UserCheck, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { GovernancePoll, WhistleblowerReport, generateZKHash } from '@/lib/midroll-zk';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
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
  const [activeSubTab, setActiveSubTab] = useState<'polls' | 'whistleblower'>('polls');

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

    setTimeout(() => setVoteProgress(60), 600);
    setTimeout(() => setVoteProgress(90), 1200);
    setTimeout(() => {
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
      {/* Header Banner */}
      <div className="card hero relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="eyebrow text-[#aebbb2] mb-2">Feature 6 &bull; Shielded Employee Voice</div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight" style={{ color: 'white' }}>
              Anonymous Governance & Whistleblower Protocol
            </h1>
            <p className="text-sm text-[#aebbb2] mt-2 max-w-2xl">
              Participate in company decision polls and submit confidential alerts with zero-knowledge membership proofs — untraceable to your identity or salary.
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-white/10 p-1.5 rounded-xl border border-white/15 shrink-0">
            <button
              onClick={() => setActiveSubTab('polls')}
              className={`py-1.5 px-3.5 rounded-lg text-xs font-bold transition ${activeSubTab === 'polls' ? 'bg-[#d7ff65] text-[#17211b]' : 'text-white hover:bg-white/5'}`}
            >
              DAO Governance Polls
            </button>
            <button
              onClick={() => setActiveSubTab('whistleblower')}
              className={`py-1.5 px-3.5 rounded-lg text-xs font-bold transition ${activeSubTab === 'whistleblower' ? 'bg-[#ffdbda] text-[#17211b]' : 'text-white hover:bg-white/5'}`}
            >
              Whistleblower Portal
            </button>
          </div>
        </div>
        <div className="orb"></div>
      </div>

      {/* Tab 1: Polls */}
      {activeSubTab === 'polls' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {polls.map((poll) => (
            <div key={poll.id} className="card flex flex-col justify-between hover:border-line">
              <div>
                <div className="card-head pb-3 border-b border-line mb-4 flex justify-between items-start">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#eef4ee] border border-line text-ink font-mono uppercase">
                      {poll.category}
                    </span>
                    <h2 className="text-base font-extrabold text-ink mt-3">{poll.title}</h2>
                    <p className="text-xs text-muted mt-1 leading-relaxed">{poll.description}</p>
                  </div>
                  <span className="text-[10px] text-muted font-mono whitespace-nowrap bg-[#f8faf7] border border-line px-2 py-0.5 rounded-md">
                    Ends: {poll.deadline}
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="space-y-3">
                    {poll.options.map((opt, idx) => {
                      const pct = poll.totalVotes > 0 ? Math.round((opt.votesCount / poll.totalVotes) * 100) : 0;
                      return (
                        <div key={idx} className="space-y-1.5">
                          <div className="flex justify-between text-xs font-medium">
                            <span className="text-ink font-semibold">{opt.text}</span>
                            <span className="text-ink font-mono font-bold">{pct}% ({opt.votesCount})</span>
                          </div>
                          <div className="w-full bg-[#edf1ed] h-2 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-ink transition-all duration-500 rounded-full"
                              style={{ width: `${pct}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-4 border-t border-line flex items-center justify-between">
                    <div className="flex items-center space-x-1.5 text-xs text-muted font-mono">
                      <UserCheck className="w-4 h-4 text-emerald-600" />
                      <span>ZK Payroll Verified</span>
                    </div>

                    <button
                      onClick={() => handleOpenVoteModal(poll)}
                      className="new py-1.5 px-3 text-xs font-semibold"
                      style={{ padding: '6px 12px', fontSize: '11px' }}
                    >
                      Cast Shielded Vote
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Whistleblower */}
      {activeSubTab === 'whistleblower' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Submit Alert Form */}
          <div className="card">
            <div className="card-head border-b border-line pb-3 mb-4">
              <div className="flex items-center space-x-2 text-xs font-semibold text-[#b45309] uppercase tracking-wider mb-1 font-mono">
                <AlertTriangle className="w-4 h-4" />
                <span>Anti-Retaliation Encrypted Channel</span>
              </div>
              <h2>Submit Anonymous Whistleblower Alert</h2>
              <p className="text-xs text-muted mt-1 leading-relaxed">
                Includes a zero-knowledge proof attesting that you are a verified MidRoll payroll recipient, while completely hiding your identity, IP address, and wallet address.
              </p>
            </div>

            <form onSubmit={handleSubmitWbReport} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted mb-1.5 font-mono">Issue Category</label>
                <select
                  value={wbCategory}
                  onChange={(e) => setWbCategory(e.target.value as any)}
                  className="flex h-11 w-full rounded-xl border border-line bg-white px-3.5 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-ink/20"
                >
                  <option value="Security Breach">Security Breach / Vulnerability</option>
                  <option value="Financial Irregularity">Financial Irregularity / Accounting Misconduct</option>
                  <option value="HR Harassment">HR Harassment / Ethics Violation</option>
                  <option value="Compliance Violation">Regulatory / Compliance Non-Conformity</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted mb-1.5 font-mono">Encrypted Confidential Report</label>
                <textarea
                  rows={4}
                  required
                  value={wbMessage}
                  onChange={(e) => setWbMessage(e.target.value)}
                  placeholder="Provide detailed information regarding the issue. All text is client-side encrypted prior to ledger commitment."
                  className="flex w-full rounded-xl border border-line bg-white px-3.5 py-2 text-xs text-ink placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-ink/20 font-sans"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingWb}
                className="new w-full justify-center py-2.5 text-xs font-bold"
                style={{ background: '#ffdbda', color: '#881337', borderColor: '#f3aaa4' }}
              >
                <Send className="w-4 h-4" />
                <span>{isSubmittingWb ? 'Synthesizing ZK Whistleblower Proof...' : 'Submit Anonymous Report'}</span>
              </button>
            </form>
          </div>

          {/* Audit Trail Log */}
          <div className="card">
            <div className="card-head border-b border-line pb-3 mb-4">
              <h2>Verified Whistleblower Audit Trail</h2>
              <p className="text-xs text-muted mt-1">Ledger-verified alerts containing ZK payroll proof hashes</p>
            </div>

            <div className="space-y-3">
              {whistleblowerReports.map((wb) => (
                <div key={wb.id} className="p-4 bg-[#f8faf7] rounded-2xl border border-line space-y-2 text-xs">
                  <div className="flex justify-between items-center font-bold">
                    <span className="text-[#881337] font-mono">{wb.id}</span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#c6f6d5] border border-[#a3e9b9] text-[#1c6434]">
                      {wb.investigationStatus}
                    </span>
                  </div>
                  <div className="text-ink font-mono text-[11px] bg-white p-2.5 rounded-xl border border-line break-all">
                    {wb.encryptedContent}
                  </div>
                  <div className="flex justify-between text-[10px] text-muted font-mono">
                    <span>ZK Proof: {wb.zkPayrollProofHash.substring(0, 16)}...</span>
                    <span>{wb.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Cast Vote Modal */}
      <Dialog open={Boolean(selectedPoll)} onOpenChange={(open) => !open && setSelectedPoll(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cast Anonymous ZK Vote</DialogTitle>
            <DialogDescription>{selectedPoll?.title}</DialogDescription>
          </DialogHeader>

          <div className="space-y-2.5 my-2">
            {selectedPoll?.options.map((opt, idx) => (
              <label
                key={idx}
                onClick={() => setSelectedOption(idx)}
                className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition text-xs font-semibold ${
                  selectedOption === idx
                    ? 'bg-[#eaf1ea] border-ink text-ink font-bold shadow-sm'
                    : 'bg-white border-line text-ink hover:border-ink'
                }`}
              >
                <span>{opt.text}</span>
                <input
                  type="radio"
                  name="vote_option"
                  checked={selectedOption === idx}
                  onChange={() => setSelectedOption(idx)}
                  className="accent-ink"
                />
              </label>
            ))}

            {isVoting && (
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-xs text-ink font-bold font-mono">
                  <span>Generating Groth16 Nullifier Proof...</span>
                  <span>{voteProgress}%</span>
                </div>
                <div className="w-full bg-[#edf1ed] h-2 rounded-full overflow-hidden">
                  <div className="h-full bg-ink transition-all duration-300" style={{ width: `${voteProgress}%` }}></div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" disabled={isVoting} onClick={() => setSelectedPoll(null)}>
              Cancel
            </Button>
            <Button disabled={isVoting} onClick={handleExecuteVote} type="submit">
              Confirm Vote
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
