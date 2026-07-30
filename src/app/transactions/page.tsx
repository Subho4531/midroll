'use client';

import React from 'react';
import { AppShell } from '@/components/AppShell';
import { ShieldedExpenses } from '@/components/ShieldedExpenses';
import { TransactionsPage } from '@/components/TransactionsPage';
import { useAppContext } from '@/lib/app-context';

export default function TransactionsPageRoute() {
  const { receipts, handleAddReceipt, handleReimburse } = useAppContext();

  return (
    <AppShell>
      <div className="pt-2 space-y-10">
        {/* On-chain transaction history with explorer links */}
        <TransactionsPage />

        {/* ZK Expense Receipts section */}
        <ShieldedExpenses
          receipts={receipts}
          onAddReceipt={handleAddReceipt}
          onReimburse={handleReimburse}
        />
      </div>
    </AppShell>
  );
}
