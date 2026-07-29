'use client';

import React, { useState } from 'react';
import { Header, ActiveTab } from '@/components/Header';
import { ShieldedExpenses } from '@/components/ShieldedExpenses';
import { AnonymousGovernance } from '@/components/AnonymousGovernance';
import { EmployerPortal } from '@/components/EmployerPortal';
import { CompactContractViewer } from '@/components/CompactContractViewer';
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
import { Shield, Search, Bell, Wallet } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useLaceWallet } from '@/lib/lace-wallet-context';

export default function Home() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('expenses');
  const { isConnected, connect } = useLaceWallet();
  
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

  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const getCrumbText = () => {
    switch (activeTab) {
      case 'expenses':
        return 'MIDROLL / SHIELDED EXPENSES';
      case 'governance':
        return 'MIDROLL / ANONYMOUS GOVERNANCE';
      case 'employer':
        return 'MIDROLL / EMPLOYER PORTAL';
      case 'contract':
        return 'MIDROLL / COMPACT CODE';
      default:
        return 'MIDROLL / DASHBOARD';
    }
  };

  return (
    <div className="shell selection:bg-[#d7ff65] selection:text-[#17211b]">
      {/* Sidebar Navigation */}
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Workspace Column */}
      <main className="main">
        {/* Top Header Bar */}
        <header className="top">
          <div className="crumb">{getCrumbText()}</div>
          <div className="top-actions">
            <button className="icon-btn" aria-label="Search">
              <Search className="w-4 h-4" />
            </button>
            <button className="icon-btn" aria-label="Notifications">
              <Bell className="w-4 h-4" />
            </button>
            {!isConnected && (
              <button className="new" onClick={connect}>
                <Wallet className="w-4 h-4" /> Connect Lace
              </button>
            )}
          </div>
        </header>

        {/* Intro Section */}
        <section className="intro">
          <div>
            <div className="eyebrow">{todayStr}</div>
            <h1>Good morning, Subho.</h1>
          </div>
          <p>Your workspace is running with ZK-hardened compliance and payroll integrity.</p>
        </section>

        {/* Dynamic Main Content */}
        <div className="space-y-8">
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

        {/* Footer Area */}
        <footer className="border-t border-line mt-16 pt-8 pb-12 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-ink" />
            <span className="font-bold text-ink">MidRoll Protocol</span>
            <span>&bull; Built for Midnight Blockchain (Rise In Challenge Level 1)</span>
          </div>

          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="text-[11px] border-line text-muted bg-[#eef4ee]">
              Feature 5: Shielded Expenses
            </Badge>
            <Badge variant="outline" className="text-[11px] border-line text-muted bg-[#eef4ee]">
              Feature 6: Anonymous Governance
            </Badge>
            <Badge variant="outline" className="text-[11px] border-line text-muted bg-[#eef4ee]">
              Compact DSL v0.23
            </Badge>
          </div>
        </footer>
      </main>
    </div>
  );
}
