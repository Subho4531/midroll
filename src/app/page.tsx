'use client';

import React, { useState } from 'react';
import { Header, ActiveTab } from '@/components/Header';
import { PayFlowDashboard } from '@/components/PayFlowDashboard';
import { EmployerPortal } from '@/components/EmployerPortal';
import { ZKProofGenerator } from '@/components/ZKProofGenerator';
import { ProofVerifierPortal } from '@/components/ProofVerifierPortal';
import { ShieldedExpenses } from '@/components/ShieldedExpenses';
import { CompactContractViewer } from '@/components/CompactContractViewer';
import {
  Employee,
  ZKProofCredential,
  ExpenseReceipt,
  INITIAL_EMPLOYEES,
  INITIAL_RECEIPTS,
} from '@/lib/midzoll-zk';
import { Shield, Sparkles, Lock, FileCode } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('payflow');
  
  // App state
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [receipts, setReceipts] = useState<ExpenseReceipt[]>(INITIAL_RECEIPTS);
  const [proofCredentials, setProofCredentials] = useState<ZKProofCredential[]>([]);
  
  const [walletBalance, setWalletBalance] = useState<number>(128400.50);
  const [tDustBalance, setTDustBalance] = useState<number>(42500);

  const [treasuryBalance, setTreasuryBalance] = useState<number>(450000);

  // Current logged in user profile (Elena)
  const currentEmployee = employees[0];

  const handleClaimSuccess = (claimedUSD: number) => {
    setWalletBalance((prev) => prev + claimedUSD);
    setTDustBalance((prev) => prev + Math.floor(claimedUSD * 2.5));
    setEmployees((prev) =>
      prev.map((emp, idx) =>
        idx === 0
          ? {
              ...emp,
              totalClaimedUSD: emp.totalClaimedUSD + claimedUSD,
              lastClaimTimestamp: Date.now(),
            }
          : emp
      )
    );
  };

  const handleAddEmployee = (newEmp: Employee) => {
    setEmployees((prev) => [...prev, newEmp]);
  };

  const handleDepositTreasury = (amountUSD: number) => {
    setTreasuryBalance((prev) => prev + amountUSD);
    setWalletBalance((prev) => Math.max(0, prev - amountUSD));
  };

  const handleAddReceipt = (newRec: ExpenseReceipt) => {
    setReceipts((prev) => [newRec, ...prev]);
  };

  const handleReimburse = (receiptId: string, amountUSD: number) => {
    setReceipts((prev) =>
      prev.map((r) => (r.id === receiptId ? { ...r, zkProofStatus: 'REIMBURSED' } : r))
    );
    setWalletBalance((prev) => prev + amountUSD);
  };

  const handleProofCreated = (proof: ZKProofCredential) => {
    setProofCredentials((prev) => [proof, ...prev]);
  };

  return (
    <div className="min-h-screen bg-[#070913] text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-black">
      
      {/* Navigation Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        walletBalance={walletBalance}
        tDustBalance={tDustBalance}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'payflow' && (
          <PayFlowDashboard
            employee={currentEmployee}
            onClaimSuccess={handleClaimSuccess}
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

        {activeTab === 'zk-generator' && (
          <ZKProofGenerator
            employee={currentEmployee}
            onProofCreated={handleProofCreated}
          />
        )}

        {activeTab === 'verifier' && (
          <ProofVerifierPortal existingProofs={proofCredentials} />
        )}

        {activeTab === 'expenses' && (
          <ShieldedExpenses
            receipts={receipts}
            onAddReceipt={handleAddReceipt}
            onReimburse={handleReimburse}
          />
        )}

        {activeTab === 'contract' && <CompactContractViewer />}
      </main>

      {/* Footer */}
      <footer className="border-t border-indigo-900/30 glass-panel bg-slate-950/80 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-slate-200">MidZoll Protocol</span>
            <span>&bull; Built for Midnight Blockchain</span>
          </div>

          <div className="flex items-center space-x-6 text-slate-400">
            <span className="flex items-center gap-1 hover:text-cyan-300 transition">
              <Lock className="w-3.5 h-3.5 text-cyan-400" /> Zero-Knowledge Privacy Guaranteed
            </span>
            <span className="hover:text-cyan-300 transition">Compact Smart State</span>
            <span className="hover:text-cyan-300 transition">Midnight Network</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
