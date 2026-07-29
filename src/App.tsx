'use client';

import React, { useState } from 'react';
import { Header, ActiveTab } from '@/components/Header';
import { ShieldedExpenses } from '@/components/ShieldedExpenses';
import { AnonymousGovernance } from '@/components/AnonymousGovernance';
import { EmployerPortal } from '@/components/EmployerPortal';
import { CompactContractViewer } from '@/components/CompactContractViewer';
import { WalletConnect } from '@/components/WalletConnect';
import { CircuitCall } from '@/components/CircuitCall';
import { useLaceWallet } from '@/lib/lace-wallet-context';
import {
  Employee,
  ExpenseReceipt,
  GovernancePoll,
  WhistleblowerReport,
  INITIAL_EMPLOYEES,
  INITIAL_RECEIPTS,
  INITIAL_POLLS,
  INITIAL_WHISTLEBLOWER_REPORTS,
} from '@/lib/midroll-zk';
import { Shield, Sparkles, AlertCircle, Info, Clock, CheckCircle2, History, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const { isConnected, walletAddress, network } = useLaceWallet();
  
  // App state
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [receipts, setReceipts] = useState<ExpenseReceipt[]>(INITIAL_RECEIPTS);
  const [polls, setPolls] = useState<GovernancePoll[]>(INITIAL_POLLS);
  const [whistleblowerReports, setWhistleblowerReports] = useState<WhistleblowerReport[]>(INITIAL_WHISTLEBLOWER_REPORTS);
  
  const [treasuryBalance, setTreasuryBalance] = useState<number>(450000);

  const handleAddEmployee = (newEmp: Employee) => {
    setEmployees((prev) => [...prev, newEmp]);
  };

  const handleDepositTreasury = (amountUSD: number) => {
    setTreasuryBalance((prev) => prev + amountUSD);
  };

  const handleAddReceipt = (newRec: ExpenseReceipt) => {
    setReceipts((prev) => [newRec, ...prev]);
  };

  const handleReimburse = (receiptId: string) => {
    setReceipts((prev) =>
      prev.map((r) => (r.id === receiptId ? { ...r, zkProofStatus: 'REIMBURSED' } : r))
    );
  };

  const handleCastVote = (pollId: string, optionIndex: number) => {
    setPolls((prev) =>
      prev.map((p) => {
        if (p.id === pollId) {
          const updatedOptions = p.options.map((opt, idx) =>
            idx === optionIndex ? { ...opt, votesCount: opt.votesCount + 1 } : opt
          );
          return {
            ...p,
            options: updatedOptions,
            totalVotes: p.totalVotes + 1,
            userVotedOption: optionIndex,
          };
        }
        return p;
      })
    );
  };

  const handleSubmitWhistleblowerReport = (report: WhistleblowerReport) => {
    setWhistleblowerReports((prev) => [report, ...prev]);
  };

  const formatUSD = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good morning';
    if (hr < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="shell min-h-screen bg-[#f8faf7] text-[#17211b] selection:bg-purple-500 selection:text-white">
      
      {/* Left Sidebar Navigation */}
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Right Main Panel */}
      <main className="main">
        {/* Top Control Bar */}
        <header className="top">
          <div className="crumb text-[10px] tracking-wider uppercase font-mono text-slate-400">
            MIDROLL PROTOCOL / {activeTab.toUpperCase()}
          </div>
          <div className="top-actions">
            <button className="icon-btn flex items-center justify-center font-bold text-slate-500 hover:text-slate-900 border border-slate-200 bg-white rounded-lg shadow-sm hover:shadow transition" aria-label="Search">⌕</button>
            <button className="icon-btn flex items-center justify-center font-bold text-slate-500 hover:text-slate-900 border border-slate-200 bg-white rounded-lg shadow-sm hover:shadow transition" aria-label="Notifications">◌</button>
            {activeTab === 'expenses' && (
              <button className="new" onClick={() => setActiveTab('expenses')}>
                + File Expense
              </button>
            )}
            {activeTab === 'employer' && (
              <button className="new" onClick={() => setActiveTab('employer')}>
                + Register Worker
              </button>
            )}
            {activeTab === 'overview' && (
              <button className="new" onClick={() => setActiveTab('contract')}>
                View Compact Schema
              </button>
            )}
          </div>
        </header>

        {/* Dynamic Welcome Heading */}
        <section className="intro">
          <div>
            <div className="eyebrow text-[10px] tracking-widest font-mono text-[#4c855a] uppercase">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#17211b] mt-1">
              {getGreeting()}, {isConnected ? 'Subho' : 'Guest'}.
            </h1>
          </div>
          <p className="text-slate-500 max-w-[320px] text-xs leading-relaxed">
            {isConnected 
              ? `Authorized session active on ${network.toUpperCase()} network. Your shielded payroll is verified.` 
              : 'Please connect your Lace for Midnight Wallet to unlock payroll management operations.'}
          </p>
        </section>

        {/* Dashboard Overview Hub */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Metrics Cards */}
            <section className="metrics grid grid-cols-1 md:grid-cols-4 gap-4">
              <article className="card hero bg-[#17211b] text-white p-5 rounded-2xl relative overflow-hidden min-h-[150px] shadow-lg border border-[#17211b]">
                <div className="label text-[10px] tracking-widest font-mono text-slate-400 uppercase">
                  Shielded Treasury
                </div>
                <div className="metric text-3xl font-extrabold tracking-tight text-white mt-3">
                  {formatUSD(treasuryBalance)}
                </div>
                <div className="trend text-[10px] text-[#d7ff65] font-bold mt-2">
                  ↑ 100% On-Chain Collateralized
                </div>
                <div className="orb absolute w-[200px] h-[200px] rounded-full border border-[#d7ff65]/20 right-[-10px] top-[-50px]"></div>
              </article>

              <article className="card bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
                <div className="label text-[10px] tracking-widest font-mono text-slate-400 uppercase">
                  Registered Workers
                </div>
                <div className="metric text-3xl font-extrabold tracking-tight text-[#17211b] mt-3">
                  {employees.length}
                </div>
                <div className="trend text-[10px] text-[#31834b] font-bold mt-2">
                  ↑ Active Payroll Streams
                </div>
              </article>

              <article className="card bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
                <div className="label text-[10px] tracking-widest font-mono text-slate-400 uppercase">
                  Shielded Receipts
                </div>
                <div className="metric text-3xl font-extrabold tracking-tight text-[#17211b] mt-3">
                  {receipts.length}
                </div>
                <div className="trend text-[10px] text-[#31834b] font-bold mt-2">
                  ↑ {receipts.filter(r => r.zkProofStatus === 'REIMBURSED').length} Approved & Paid
                </div>
              </article>

              <article className="card bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
                <div className="label text-[10px] tracking-widest font-mono text-slate-400 uppercase">
                  ZK Proof Velocity
                </div>
                <div className="metric text-3xl font-extrabold tracking-tight text-[#17211b] mt-3">
                  99.8%
                </div>
                <div className="trend text-[10px] text-[#31834b] font-bold mt-2">
                  ↑ Groth16 Prover Success
                </div>
              </article>
            </section>

            {/* Level 2 Challenge Controls & Activity Console */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
              <div className="lg:col-span-2 space-y-6">
                {/* Wallet Connection & ZK Proof Prover Panel */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <WalletConnect />
                  <CircuitCall />
                </div>
              </div>

              {/* Live activity feed from outputs/nimbus-dashboard.html */}
              <article className="card bg-white border border-slate-200 p-5 rounded-2xl shadow-sm h-full flex flex-col">
                <div className="card-head flex items-center justify-between mb-4">
                  <h2 className="text-sm font-extrabold tracking-tight text-[#17211b] flex items-center gap-1.5">
                    <History className="w-4 h-4 text-slate-500" />
                    Live Protocol Log
                  </h2>
                  <Badge variant="secondary" className="text-[9px] uppercase font-mono">Real-Time</Badge>
                </div>
                <div className="activity divide-y divide-slate-100 flex-1 overflow-y-auto max-h-[300px] pr-1 space-y-2">
                  <div className="activity-row flex items-center gap-3 py-2.5">
                    <i className="status w-2 h-2 rounded-full bg-emerald-500 shrink-0"></i>
                    <div className="flex-1">
                      <b className="text-xs text-[#17211b] block">Wallet context initialized</b>
                      <span className="text-[10px] text-slate-400">CAIP-372 Handshake Active</span>
                    </div>
                    <time className="text-[10px] font-mono text-slate-400">Just now</time>
                  </div>
                  <div className="activity-row flex items-center gap-3 py-2.5">
                    <i className="status w-2 h-2 rounded-full bg-purple-400 shrink-0"></i>
                    <div className="flex-1">
                      <b className="text-xs text-[#17211b] block">ZKP circuits compiled</b>
                      <span className="text-[10px] text-slate-400">Compact schema verified</span>
                    </div>
                    <time className="text-[10px] font-mono text-slate-400">12m</time>
                  </div>
                  <div className="activity-row flex items-center gap-3 py-2.5">
                    <i className="status w-2 h-2 rounded-full bg-blue-400 shrink-0"></i>
                    <div className="flex-1">
                      <b className="text-xs text-[#17211b] block">Mock treasury funded</b>
                      <span className="text-[10px] text-slate-400">$450,000 USD secured</span>
                    </div>
                    <time className="text-[10px] font-mono text-slate-400">1h</time>
                  </div>
                </div>
              </article>
            </section>
          </div>
        )}

        {/* Tab Panel Workflows */}
        <div className="pt-2">
          {activeTab === 'expenses' && (
            <ShieldedExpenses
              receipts={receipts}
              onAddReceipt={handleAddReceipt}
              onReimburse={handleReimburse}
            />
          )}

          {activeTab === 'governance' && (
            <AnonymousGovernance
              polls={polls}
              onCastVote={handleCastVote}
              whistleblowerReports={whistleblowerReports}
              onSubmitWhistleblowerReport={handleSubmitWhistleblowerReport}
            />
          )}

          {activeTab === 'employer' && (
            <EmployerPortal
              employees={employees}
              onAddEmployee={handleAddEmployee}
              treasuryBalanceUSD={treasuryBalance}
              onDepositTreasury={handleDepositTreasury}
            />
          )}

          {activeTab === 'contract' && <CompactContractViewer />}
        </div>
      </main>
    </div>
  );
}
