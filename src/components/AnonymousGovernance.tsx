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
      <Card className="border-cyan-500/30 bg-slate-950/90 shadow-2xl relative overflow-hidden">
        <CardHeader className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="flex items-center space-x-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-2">
                <Vote className="w-4 h-4" />
                <span>Feature 6 &bull; Shielded Employee Voice</span>
              </div>
              <CardTitle className="text-3xl font-extrabold text-white">
                Anonymous Governance & <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">Whistleblower Protocol</span>
              </CardTitle>
              <CardDescription className="text-sm text-slate-300 mt-1 max-w-2xl">
                Participate in company decision polls and submit confidential alerts with zero-knowledge membership proofs — untraceable to your identity or salary.
              </CardDescription>
            </div>

            <div className="flex items-center space-x-2 bg-slate-900/90 p-1.5 rounded-2xl border border-indigo-900/50 shrink-0">
              <Button
                variant={activeSubTab === 'polls' ? 'cyan' : 'ghost'}
                size="sm"
                onClick={() => setActiveSubTab('polls')}
              >
                DAO Governance Polls
              </Button>
              <Button
                variant={activeSubTab === 'whistleblower' ? 'destructive' : 'ghost'}
                size="sm"
                onClick={() => setActiveSubTab('whistleblower')}
              >
                Whistleblower Portal
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tab 1: Polls */}
      {activeSubTab === 'polls' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {polls.map((poll) => (
            <Card key={poll.id} className="border-indigo-900/40 flex flex-col justify-between hover:border-cyan-500/40">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="cyan">{poll.category}</Badge>
                  <span className="text-[11px] text-slate-400 font-mono">Ends: {poll.deadline}</span>
                </div>
                <CardTitle className="text-base text-white">{poll.title}</CardTitle>
                <CardDescription className="text-xs text-slate-300">{poll.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {poll.options.map((opt, idx) => {
                    const pct = poll.totalVotes > 0 ? Math.round((opt.votesCount / poll.totalVotes) * 100) : 0;
                    return (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-medium">
                          <span className="text-slate-200">{opt.text}</span>
                          <span className="text-cyan-400 font-mono font-bold">{pct}% ({opt.votesCount})</span>
                        </div>
                        <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                          <div
                            className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500 transition-all duration-500 rounded-full"
                            style={{ width: `${pct}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-4 border-t border-indigo-900/40 flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 text-xs text-slate-400">
                    <UserCheck className="w-4 h-4 text-emerald-400" />
                    <span>ZK Payroll Verified</span>
                  </div>

                  <Button variant="cyan" size="sm" onClick={() => handleOpenVoteModal(poll)}>
                    Cast Shielded Vote
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Tab 2: Whistleblower */}
      {activeSubTab === 'whistleblower' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Submit Alert Form */}
          <Card className="border-rose-500/30">
            <CardHeader>
              <div className="flex items-center space-x-2 text-xs font-semibold text-rose-400 uppercase tracking-wider mb-1">
                <AlertTriangle className="w-4 h-4" />
                <span>Anti-Retaliation Encrypted Channel</span>
              </div>
              <CardTitle className="text-xl">Submit Anonymous Whistleblower Alert</CardTitle>
              <CardDescription>
                Includes a zero-knowledge proof attesting that you are a verified MidRoll payroll recipient, while completely hiding your identity, IP address, and wallet address.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmitWbReport} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Issue Category</label>
                  <select
                    value={wbCategory}
                    onChange={(e) => setWbCategory(e.target.value as any)}
                    className="flex h-11 w-full rounded-xl border border-indigo-900/50 bg-slate-950 px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                  >
                    <option value="Security Breach">Security Breach / Vulnerability</option>
                    <option value="Financial Irregularity">Financial Irregularity / Accounting Misconduct</option>
                    <option value="HR Harassment">HR Harassment / Ethics Violation</option>
                    <option value="Compliance Violation">Regulatory / Compliance Non-Conformity</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Encrypted Confidential Report</label>
                  <textarea
                    rows={4}
                    required
                    value={wbMessage}
                    onChange={(e) => setWbMessage(e.target.value)}
                    placeholder="Provide detailed information regarding the issue. All text is client-side encrypted prior to ledger commitment."
                    className="flex w-full rounded-xl border border-indigo-900/50 bg-slate-950 px-3.5 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                  />
                </div>

                <Button
                  type="submit"
                  variant="destructive"
                  size="lg"
                  disabled={isSubmittingWb}
                  className="w-full gap-2 mt-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmittingWb ? 'Synthesizing ZK Whistleblower Proof...' : 'Submit Anonymous Report'}</span>
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Audit Trail Log */}
          <Card className="border-indigo-900/40">
            <CardHeader>
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-cyan-400" />
                <span>Verified Whistleblower Audit Trail</span>
              </CardTitle>
              <CardDescription>Ledger-verified alerts containing ZK payroll proof hashes</CardDescription>
            </CardHeader>

            <CardContent className="space-y-3">
              {whistleblowerReports.map((wb) => (
                <div key={wb.id} className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between items-center font-bold">
                    <span className="text-rose-400 font-mono">{wb.id}</span>
                    <Badge variant="emerald">{wb.investigationStatus}</Badge>
                  </div>
                  <div className="text-slate-300 font-mono text-[11px] bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    {wb.encryptedContent}
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>ZK Proof: {wb.zkPayrollProofHash.substring(0, 16)}...</span>
                    <span>{wb.timestamp}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
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
                className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition text-xs font-medium ${
                  selectedOption === idx
                    ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 font-bold shadow-[0_0_15px_rgba(0,240,255,0.15)]'
                    : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:border-slate-700'
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

            {isVoting && (
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-xs text-cyan-400 font-semibold">
                  <span>Generating Groth16 Nullifier Proof...</span>
                  <span>{voteProgress}%</span>
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div className="h-full bg-cyan-400 transition-all duration-300" style={{ width: `${voteProgress}%` }}></div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" disabled={isVoting} onClick={() => setSelectedPoll(null)}>
              Cancel
            </Button>
            <Button variant="cyan" disabled={isVoting} onClick={handleExecuteVote}>
              Confirm Vote
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
