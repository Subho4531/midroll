'use client';

import React from 'react';
import { AppShell } from '@/components/AppShell';
import { EmployerPortal } from '@/components/EmployerPortal';
import { useAppContext } from '@/lib/app-context';

export default function SettingsPage() {
  const {
    employees,
    handleAddEmployee,
    treasuryBalance,
    handleDepositTreasury,
  } = useAppContext();

  return (
    <AppShell>
      <div className="pt-2">
        <EmployerPortal
          employees={employees}
          onAddEmployee={handleAddEmployee}
          treasuryBalanceUSD={treasuryBalance}
          onDepositTreasury={handleDepositTreasury}
        />
      </div>
    </AppShell>
  );
}
