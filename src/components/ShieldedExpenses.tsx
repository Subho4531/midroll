'use client';

import React, { useState } from 'react';
import { CreditCard, ShieldCheck, Plus, CheckCircle2, Upload, Sparkles, FileText, ArrowRight } from 'lucide-react';
import { ExpenseReceipt, formatUSD, generateZKHash } from '@/lib/midroll-zk';
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
      employeeShieldedId: 'emp_zk_9821',
      zkProofStatus: 'VERIFIED_SHIELDED',
      proofCommitment: generateZKHash('0xproof_receipt'),
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
      {/* Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-purple-500/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-purple-400 uppercase tracking-wider mb-2">
              <CreditCard className="w-4 h-4" />
              <span>Shielded Treasury Protocol</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white">
              Corporate <span className="text-gradient-cyan">ZK Expense Reimbursements</span>
            </h1>
            <p className="text-sm text-slate-300 mt-1">
              Submit zero-knowledge merchant receipt proofs for instant payout without revealing private card details or itemized items.
            </p>
          </div>

          <button
            onClick={() => setIsSubmitModalOpen(true)}
            className="px-5 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-purple-500/20 transition cursor-pointer flex items-center space-x-2 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Submit Shielded Expense</span>
          </button>
        </div>
      </div>

      {/* Receipts Table */}
      <div className="glass-panel p-6 rounded-2xl border border-indigo-900/40">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
          <FileText className="w-5 h-5 text-purple-400" />
          <span>Active Expense Proof Submissions</span>
        </h2>

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
                    <span className="px-2.5 py-1 rounded-md text-xs bg-purple-950/80 border border-purple-800/40 text-purple-300">
                      {rec.category}
                    </span>
                  </td>
                  <td className="py-4 font-mono font-semibold text-cyan-300">
                    {formatUSD(rec.amountUSD)}
                  </td>
                  <td className="py-4 text-xs font-mono text-slate-400">
                    {rec.proofCommitment.substring(0, 16)}...
                  </td>
                  <td className="py-4">
                    {rec.zkProofStatus === 'REIMBURSED' ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-950/80 text-emerald-300 border border-emerald-800/40 gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Reimbursed
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-950/80 text-amber-300 border border-amber-800/40 gap-1">
                        <ShieldCheck className="w-3 h-3" /> ZK Verified
                      </span>
                    )}
                  </td>
                  <td className="py-4 text-right">
                    {rec.zkProofStatus !== 'REIMBURSED' && (
                      <button
                        disabled={reimbursementLoadingId === rec.id}
                        onClick={() => handleReimburseClick(rec)}
                        className="px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-bold rounded-lg shadow cursor-pointer disabled:opacity-50"
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

      {/* Submit Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="glass-panel max-w-md w-full p-6 rounded-2xl border border-purple-500/40">
            <h3 className="text-lg font-bold text-white mb-2">Submit Shielded Merchant Receipt</h3>
            <p className="text-xs text-slate-300 mb-4">Generates ZK proof attesting expense category and policy limit compliance.</p>

            <form onSubmit={handleSubmitReceipt} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Merchant Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. OpenAI Cloud API"
                  value={merchantName}
                  onChange={(e) => setMerchantName(e.target.value)}
                  className="w-full glass-input p-3 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full glass-input p-3 rounded-xl text-sm bg-slate-900"
                >
                  <option value="Software & Cloud">Software & Cloud</option>
                  <option value="Travel & Lodging">Travel & Lodging</option>
                  <option value="Meals & Entertainment">Meals & Entertainment</option>
                  <option value="Hardware">Hardware</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Receipt Total (USD)</label>
                <input
                  type="number"
                  required
                  value={amountUSD}
                  onChange={(e) => setAmountUSD(e.target.value)}
                  className="w-full glass-input p-3 rounded-xl text-sm font-mono"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-sm font-bold rounded-xl shadow-lg cursor-pointer"
                >
                  Generate ZK Proof
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
