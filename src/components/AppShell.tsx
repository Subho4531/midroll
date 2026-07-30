'use client';

import React from 'react';
import { Header } from '@/components/Header';
import { CompanyOnboardingModal } from '@/components/CompanyOnboardingModal';
import { useLaceWallet } from '@/lib/lace-wallet-context';
import { useAppContext } from '@/lib/app-context';
import { LandingPage } from '@/components/LandingPage';
import { Menu, Wallet } from 'lucide-react';

export function AppShell({ children }: { children: React.ReactNode }) {
  const { isConnected, walletAddress } = useLaceWallet();
  const {
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    isCompanyModalOpen,
    handleCompanyCreated,
  } = useAppContext();

  if (!isConnected) {
    return <LandingPage />;
  }

  return (
    <div className={`shell ${isSidebarCollapsed ? 'sidebar-collapsed' : ''} min-h-screen bg-[#f8faf7] text-[#17211b] selection:bg-purple-500 selection:text-white`}>
      {/* Left Sidebar Navigation */}
      <Header 
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />

      {/* Right Main Panel */}
      <main className="main">
        {/* Top Control Bar */}
        <header className="top">
          <div className="flex items-center gap-3">
            {isSidebarCollapsed && (
              <button 
                onClick={() => setIsSidebarCollapsed(false)}
                className="icon-btn flex items-center justify-center transition hover:bg-slate-100"
                title="Expand Sidebar"
              >
                <Menu className="w-4 h-4 text-ink" />
              </button>
            )}
          </div>
          <div className="top-actions">
            {/* Primary Connect Wallet Button in Header */}
            <button className="new flex items-center gap-2" onClick={() => window.dispatchEvent(new CustomEvent('open-wallet-modal'))}>
              <Wallet className="w-4 h-4" />
              {walletAddress ? `${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}` : 'Connect Wallet'}
            </button>
            <button className="icon-btn flex items-center justify-center font-bold text-slate-500 hover:text-slate-900 border border-slate-200 bg-white rounded-lg shadow-sm hover:shadow transition" aria-label="Search">⌕</button>
            <button className="icon-btn flex items-center justify-center font-bold text-slate-500 hover:text-slate-900 border border-slate-200 bg-white rounded-lg shadow-sm hover:shadow transition" aria-label="Notifications">◌</button>
          </div>
        </header>

        {children}
      </main>

      {/* First-Time Company Registration Modal */}
      <CompanyOnboardingModal
        isOpen={isCompanyModalOpen}
        onCompanyCreated={handleCompanyCreated}
      />
    </div>
  );
}
