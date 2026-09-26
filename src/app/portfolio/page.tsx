'use client';

import React from 'react';
import { AppShell } from '@/components/AppShell';
import { PortfolioPage } from '@/components/PortfolioPage';

export default function Portfolio() {
  return (
    <AppShell>
      <div className="pt-2">
        <PortfolioPage />
      </div>
    </AppShell>
  );
}
