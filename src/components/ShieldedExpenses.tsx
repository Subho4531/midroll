'use client';

import React, { useState } from 'react';
import { CreditCard, ShieldCheck, Plus, CheckCircle2, FileText, Sparkles, AlertCircle, Wallet } from 'lucide-react';
import { ExpenseReceipt, formatUSD, generateZKHash } from '@/lib/midroll-zk';
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
import { useLaceWallet } from '@/lib/lace-wallet-context';
import confetti from 'canvas-confetti';

interface ShieldedExpensesProps {
  receipts: ExpenseReceipt[];
  onAddReceipt: (newReceipt: ExpenseReceipt) => void;
  onReimburse: (receiptId: string, amountUSD: number) => void;
}

export const ShieldedExpenses: React.FC<ShieldedExpensesProps> = ({
  receipts,
  onAddReceipt,
  onReimburse,
}) => {
  const { isConnected, connect, walletAddress } = useLaceWallet();
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [merchantName, setMerchantName] = useState('');
  const [category, setCategory] = useState<'Travel & Lodging' | 'Software & Cloud' | 'Meals & Entertainment' | 'Hardware'>('Software & Cloud');
  const [amountUSD, setAmountUSD] = useState('450.00');

  const [reimbursementLoadingId, setReimbursementLoadingId] = useState<string | null>(null);

  const handleSubmitReceipt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!merchantName) return;

    const newRec: ExpenseReceipt = {
      id: 'rec_' + Math.floor(Math.random() * 900 + 100),
      merchantName,
      category,
      amountUSD: Number(amountUSD),
      date: new Date().toISOString().split('T')[0],
      employeeShieldedId: walletAddress ? `emp_lace_${walletAddress.substring(0, 8)}` : 'emp_zk_9821',
      zkProofStatus: 'VERIFIED_SHIELDED',
      proofCommitment: generateZKHash('0xproof_receipt_' + merchantName),
      receiptPolicyLimit: 2000,
    };

    onAddReceipt(newRec);
    setIsSubmitModalOpen(false);
    setMerchantName('');
    confetti({ particleCount: 50, spread: 50 });
  };

  const handleReimburseClick = (rec: ExpenseReceipt) => {
    setReimbursementLoadingId(rec.id);
    setTimeout(() => {
      onReimburse(rec.id, rec.amountUSD);
      setReimbursementLoadingId(null);
      confetti({ particleCount: 70, spread: 60 });
    }, 1200);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Banner Card */}
      <Card className="border-purple-500/30 bg-slate-950/90 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none text-purple-400">
          <CreditCard className="w-64 h-64" />
        </div>

        <CardHeader className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="flex items-center space-x-2 text-xs font-semibold text-purple-400 uppercase tracking-wider mb-2">
                <CreditCard className="w-4 h-4" />
                <span>Feature 5 &bull; Shielded Corporate Expenses</span>
              </div>
              <CardTitle className="text-3xl font-extrabold text-white">
                Corporate <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">ZK Expense Reimbursements</span>
              </CardTitle>
              <CardDescription className="text-sm text-slate-300 mt-1 max-w-2xl">
                Submit zero-knowledge merchant receipt proofs for instant payout to disposable stealth addresses without exposing itemized credit card details.
              </CardDescription>
            </div>

            <Button
              variant="purple"
              size="lg"
              onClick={() => setIsSubmitModalOpen(true)}
              className="gap-2 shrink-0 shadow-purple-500/20"
            >
              <Plus className="w-5 h-5" />
              <span>Submit Shielded Expense</span>
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Wallet Status Prompt if not connected */}
      {!isConnected && (
        <Card className="border-cyan-500/30 bg-slate-900/60 p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3 text-xs text-slate-300">
              <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shrink-0">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-white text-sm">Lace Wallet Not Connected</div>
                <div>Connect your Lace for Midnight wallet to sign ZK proofs directly from your browser.</div>
              </div>
            </div>
            <Button variant="cyan" size="sm" onClick={connect} className="gap-2 shrink-0">
              <Wallet className="w-4 h-4" />
              <span>Connect Lace</span>
            </Button>
          </div>
        </Card>
      )}

      {/* Receipts Table Card */}
      <Card className="border-indigo-900/40">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-400" />
            <span>Active Expense Proof Submissions</span>
          </CardTitle>
          <CardDescription>
            Proof-verified expense claims waiting for disbursement or settled via Midnight stealth address.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-indigo-900/40 text-xs text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 font-semibold">Merchant / Date</th>
                  <th className="pb-3 font-semibold">Category</th>
                  <th className="pb-3 font-semibold">Amount</th>
                  <th className="pb-3 font-semibold">ZK Proof Commitment</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-indigo-900/30 text-slate-200">
                {receipts.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-900/50 transition">
                    <td className="py-4 pr-4">
                      <div className="font-bold text-white">{rec.merchantName}</div>
                      <div className="text-xs text-slate-400">{rec.date}</div>
                    </td>
                    <td className="py-4">
                      <Badge variant="default">{rec.category}</Badge>
                    </td>
                    <td className="py-4 font-mono font-semibold text-cyan-300">
                      {formatUSD(rec.amountUSD)}
                    </td>
                    <td className="py-4 text-xs font-mono text-slate-400">
                      {rec.proofCommitment.substring(0, 16)}...
                    </td>
                    <td className="py-4">
                      {rec.zkProofStatus === 'REIMBURSED' ? (
                        <Badge variant="emerald">
                          <CheckCircle2 className="w-3 h-3" /> Reimbursed
                        </Badge>
                      ) : (
                        <Badge variant="amber">
                          <ShieldCheck className="w-3 h-3" /> ZK Verified
                        </Badge>
                      )}
                    </td>
                    <td className="py-4 text-right">
                      {rec.zkProofStatus !== 'REIMBURSED' && (
                        <Button
                          variant="cyan"
                          size="sm"
                          disabled={reimbursementLoadingId === rec.id}
                          onClick={() => handleReimburseClick(rec)}
                        >
                          {reimbursementLoadingId === rec.id ? 'Reimbursing...' : 'Disburse Funds'}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Submit Expense Modal */}
      <Dialog open={isSubmitModalOpen} onOpenChange={setIsSubmitModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Submit Shielded Merchant Receipt</DialogTitle>
            <DialogDescription>
              Generates zero-knowledge proof attesting expense category and policy limit compliance.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitReceipt} className="space-y-4 my-2">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Merchant Name</label>
              <Input
                type="text"
                required
                placeholder="e.g. OpenAI Cloud API"
                value={merchantName}
                onChange={(e) => setMerchantName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="flex h-11 w-full rounded-xl border border-indigo-900/50 bg-slate-950 px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              >
                <option value="Software & Cloud">Software & Cloud</option>
                <option value="Travel & Lodging">Travel & Lodging</option>
                <option value="Meals & Entertainment">Meals & Entertainment</option>
                <option value="Hardware">Hardware</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Receipt Total (USD)</label>
              <Input
                type="number"
                required
                value={amountUSD}
                onChange={(e) => setAmountUSD(e.target.value)}
                className="font-mono text-base"
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsSubmitModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="purple">
                Generate ZK Proof
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
