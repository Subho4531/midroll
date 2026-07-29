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
import { Shield, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function Home() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('expenses');
  
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

  return (
    <div className="min-h-screen bg-[#070913] text-slate-100 flex flex-col selection:bg-purple-500 selection:text-white">
      
      {/* Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
      </main>

      {/* Footer */}
      <footer className="border-t border-indigo-900/40 bg-slate-950/90 backdrop-blur-xl py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-purple-400" />
            <span className="font-bold text-slate-200">MidRoll Protocol</span>
            <span>&bull; Built for Midnight Blockchain (Rise In Challenge Level 1)</span>
          </div>

          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="text-[11px]">Feature 5: Shielded Expenses</Badge>
            <Badge variant="outline" className="text-[11px]">Feature 6: Anonymous Governance</Badge>
            <Badge variant="cyan" className="text-[11px]">Compact DSL v0.23</Badge>
          </div>
        </div>
      </footer>

    </div>
  );
}
