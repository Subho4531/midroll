'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useLaceWallet } from '@/lib/lace-wallet-context';
import { CheckCircle2, ExternalLink, RefreshCw, ArrowUpRight, Users, User, Repeat, Copy, Check, Receipt } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface TxRecord {
  id: string;
  txHash: string;
  type: string;
  amount: number;
  recipientCount: number;
  status: string;
  metadata: string | null;
  createdAt: string;
}

const EXPLORER_BASE = process.env.NEXT_PUBLIC_EXPLORER_URL || 'https://explorer.1am.xyz/tx';

const typeLabel = (type: string) => {
  switch (type) {
    case 'SINGLE_PAYMENT': return 'Single Payment';
    case 'BATCH_PAYMENT': return 'Batch Payment';
    case 'SEQUENTIAL_PAYMENT': return 'Sequential Payment';
    default: return type;
  }
};

const TypeIcon = ({ type }: { type: string }) => {
  if (type === 'BATCH_PAYMENT') return <Users className="w-3.5 h-3.5" />;
  if (type === 'SEQUENTIAL_PAYMENT') return <Repeat className="w-3.5 h-3.5" />;
  return <User className="w-3.5 h-3.5" />;
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <button
      onClick={handleCopy}
      className="ml-1 text-muted hover:text-ink transition"
      title="Copy tx hash"
    >
      {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
    </button>
  );
}

export function TransactionsPage() {
  const { isConnected, walletAddress } = useLaceWallet();
  const [records, setRecords] = useState<TxRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    if (!walletAddress) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/transactions?walletAddress=${encodeURIComponent(walletAddress)}`);
      if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
      const data = await res.json();
      setRecords(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e.message || 'Failed to load transactions');
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress]);

  useEffect(() => {
    if (isConnected && walletAddress) {
      fetchTransactions();
    }
  }, [isConnected, walletAddress, fetchTransactions]);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
      ' · ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="card hero relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="eyebrow text-[#aebbb2] mb-2">On-Chain · Midnight Network</div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight" style={{ color: 'white' }}>
              Transaction History
            </h1>
            <p className="text-sm text-[#aebbb2] mt-2 max-w-xl">
              All confirmed payroll and payment transactions submitted to the Midnight blockchain. Each entry links directly to the on-chain explorer.
            </p>
          </div>
          <button
            onClick={fetchTransactions}
            disabled={isLoading}
            className="new shrink-0 flex items-center gap-2"
            style={{ background: 'var(--lime)', color: 'var(--ink)' }}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
        <img
          src="/images/dust.png"
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none z-0 opacity-20"
        />
      </div>

      {/* Table card */}
      <div className="card">
        <div className="card-head">
          <div>
            <h2>On-Chain Transactions</h2>
            <p className="text-xs text-muted mt-1">
              {records.length > 0
                ? `${records.length} transaction${records.length !== 1 ? 's' : ''} recorded`
                : 'Transactions appear here after wallet confirmation'}
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
            {error}
          </div>
        )}

        {isLoading && records.length === 0 && (
          <div className="flex items-center justify-center py-16 text-muted text-sm gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            Loading transactions...
          </div>
        )}

        {!isLoading && records.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#eef4ee] border border-line flex items-center justify-center">
              <Receipt className="w-6 h-6 text-muted" />
            </div>
            <div>
              <p className="font-bold text-sm text-ink">No transactions yet</p>
              <p className="text-xs text-muted mt-1">
                Send a payment from the Dashboard. It will appear here with a real on-chain hash.
              </p>
            </div>
          </div>
        )}

        {records.length > 0 && (
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs text-muted uppercase tracking-wider font-mono">
                  <th className="pb-3 font-semibold">Type</th>
                  <th className="pb-3 font-semibold">Recipient / Info</th>
                  <th className="pb-3 font-semibold">Amount</th>
                  <th className="pb-3 font-semibold">Tx Hash</th>
                  <th className="pb-3 font-semibold">Date</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Explorer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line text-ink">
                {records.map((rec) => (
                  <tr key={rec.id} className="hover:bg-[#fbfcfa] transition">
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-lg bg-[#eef4ee] border border-line flex items-center justify-center text-[#31834b]">
                          <TypeIcon type={rec.type} />
                        </div>
                        <div>
                          <div className="font-bold text-xs text-ink">{typeLabel(rec.type)}</div>
                          {rec.recipientCount > 1 && (
                            <div className="text-[10px] text-muted font-mono">{rec.recipientCount} recipients</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 pr-4 max-w-[160px]">
                      <div className="text-xs text-ink truncate font-medium">
                        {rec.metadata || '—'}
                      </div>
                    </td>
                    <td className="py-4 pr-4 font-mono font-bold text-ink text-xs">
                      {rec.amount.toLocaleString()} tNIGHT
                    </td>
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-0.5">
                        <span className="text-[10px] font-mono text-muted select-all">
                          {rec.txHash.slice(0, 14)}…{rec.txHash.slice(-6)}
                        </span>
                        <CopyButton text={rec.txHash} />
                      </div>
                    </td>
                    <td className="py-4 pr-4 text-[10px] font-mono text-muted whitespace-nowrap">
                      {formatDate(rec.createdAt)}
                    </td>
                    <td className="py-4 pr-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#c6f6d5] border border-[#a3e9b9] text-[#1c6434]">
                        <CheckCircle2 className="w-3 h-3" />
                        {rec.status}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <a
                        href={`${EXPLORER_BASE}/${rec.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-line bg-white hover:bg-[#eef4ee] hover:border-[#31834b] text-[10px] font-bold text-ink transition"
                        title="View on Midnight Explorer"
                      >
                        <ArrowUpRight className="w-3 h-3 text-[#31834b]" />
                        Explorer
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
