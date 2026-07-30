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
      <div className="card hero relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="eyebrow text-[#aebbb2] mb-2">Feature 5 &bull; Shielded Corporate Expenses</div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight" style={{ color: 'white' }}>
              Corporate ZK Expense Reimbursements
            </h1>
            <p className="text-sm text-[#aebbb2] mt-2 max-w-2xl">
              Submit zero-knowledge merchant receipt proofs for instant payout to disposable stealth addresses without exposing itemized credit card details.
            </p>
          </div>

          <button
            onClick={() => setIsSubmitModalOpen(true)}
            className="new shrink-0"
            style={{ background: 'var(--lime)', color: 'var(--ink)' }}
          >
            <Plus className="w-5 h-5" />
            <span>Submit Shielded Expense</span>
          </button>
        </div>
        <img
          src="/images/dust.png"
          alt="Shielded Token Balance Background"
          className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none transition-transform duration-500 group-hover:scale-105 z-0 opacity-20"
        />
      </div>

      {/* Wallet Status Prompt if not connected */}
      {!isConnected && (
        <div className="card bg-[#ffdbda] border-[#ffdbda] p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3 text-xs text-[#5c2d2b]">
            <div className="p-2 rounded-xl bg-white border border-[#f3aaa4] text-[#d64a4a] shrink-0">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-[#17211b] text-sm">Lace Wallet Not Connected</div>
              <div>Connect your Lace for Midnight wallet to sign ZK proofs directly from your browser.</div>
            </div>
          </div>
          <button onClick={connect} className="new shrink-0">
            <Wallet className="w-4 h-4" />
            <span>Connect Lace</span>
          </button>
        </div>
      )}

      {/* Receipts Table Card */}
      <div className="card">
        <div className="card-head">
          <div>
            <h2>Active Expense Proof Submissions</h2>
            <p className="text-xs text-muted mt-1">
              Proof-verified expense claims waiting for disbursement or settled via Midnight stealth address.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs text-muted uppercase tracking-wider font-mono">
                <th className="pb-3 font-semibold">Merchant / Date</th>
                <th className="pb-3 font-semibold">Category</th>
                <th className="pb-3 font-semibold">Amount</th>
                <th className="pb-3 font-semibold">ZK Proof Commitment</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line text-ink">
              {receipts.map((rec) => (
                <tr key={rec.id} className="hover:bg-[#fbfcfa] transition">
                  <td className="py-4 pr-4">
                    <div className="font-bold text-ink">{rec.merchantName}</div>
                    <div className="text-xs text-muted font-mono">{rec.date}</div>
                  </td>
                  <td className="py-4">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#eef4ee] border border-line text-ink">
                      {rec.category}
                    </span>
                  </td>
                  <td className="py-4 font-mono font-semibold text-ink">
                    {formatUSD(rec.amountUSD)}
                  </td>
                  <td className="py-4 text-xs font-mono text-muted">
                    {rec.proofCommitment.substring(0, 16)}...
                  </td>
                  <td className="py-4">
                    {rec.zkProofStatus === 'REIMBURSED' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#c6f6d5] border border-[#a3e9b9] text-[#1c6434]">
                        <CheckCircle2 className="w-3 h-3" /> Reimbursed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#fffbeb] border border-[#fde68a] text-[#b45309]">
                        <ShieldCheck className="w-3 h-3" /> ZK Verified
                      </span>
                    )}
                  </td>
                  <td className="py-4 text-right">
                    {rec.zkProofStatus !== 'REIMBURSED' && (
                      <button
                        disabled={reimbursementLoadingId === rec.id}
                        onClick={() => handleReimburseClick(rec)}
                        className="new py-1.5 px-3.5 text-xs font-semibold"
                        style={{ padding: '6px 12px', fontSize: '11px' }}
                      >
                        {reimbursementLoadingId === rec.id ? 'Reimbursing...' : 'Disburse Funds'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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
              <label className="block text-xs font-semibold text-muted mb-1.5 font-mono">Merchant Name</label>
              <Input
                type="text"
                required
                placeholder="e.g. OpenAI Cloud API"
                value={merchantName}
                onChange={(e) => setMerchantName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted mb-1.5 font-mono">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="flex h-11 w-full rounded-xl border border-line bg-white px-3.5 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-ink/20"
              >
                <option value="Software & Cloud">Software & Cloud</option>
                <option value="Travel & Lodging">Travel & Lodging</option>
                <option value="Meals & Entertainment">Meals & Entertainment</option>
                <option value="Hardware">Hardware</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted mb-1.5 font-mono">Receipt Total (USD)</label>
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
              <Button type="submit">
                Generate ZK Proof
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
