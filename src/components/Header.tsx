'use client';

import React, { useState, useEffect } from 'react';
import { Shield, CreditCard, Vote, Building2, FileCode, Wallet, CheckCircle2, Home, ChevronLeft } from 'lucide-react';
import { useLaceWallet } from '@/lib/lace-wallet-context';
import { LaceWalletModal } from '@/components/LaceWalletModal';

export type ActiveTab = 'dashboard' | 'transactions' | 'contacts' | 'settings';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, isCollapsed, setIsCollapsed }) => {
  const { isConnected, walletAddress, tDustBalance, network } = useLaceWallet();
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  useEffect(() => {
    const handleOpenModal = () => setIsWalletModalOpen(true);
    window.addEventListener('open-wallet-modal', handleOpenModal);
    return () => window.removeEventListener('open-wallet-modal', handleOpenModal);
  }, []);

  const formatShortAddr = (addr: string | null) => {
    if (!addr) return '';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  const handleProfileClick = () => {
    setIsWalletModalOpen(true);
  };

  return (
    <>
      <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        {/* Brand logo & collapse trigger */}
        <div className="flex items-center justify-between w-full">
          <div className="brand cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <span className="mark"></span>
            MidRoll
          </div>
          <button 
            onClick={() => setIsCollapsed(true)}
            className="icon-btn hover:bg-slate-100 transition rounded-lg p-1 w-8 h-8 flex items-center justify-center shrink-0"
            title="Collapse Sidebar"
          >
            <ChevronLeft className="w-4 h-4 text-ink" />
          </button>
        </div>

        {/* Network / Workspace switcher */}
        <div className="workspace">
          <button onClick={() => setIsWalletModalOpen(true)}>
            {isConnected ? `${network.toUpperCase()} Network` : 'Orbit Labs'}
            <span>⌄</span>
          </button>
        </div>

        {/* Navigation links */}
        <nav className="nav">
          <h4>Workspace</h4>
          <a
            href="#dashboard"
            className={activeTab === 'dashboard' ? 'active' : ''}
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('dashboard');
            }}
          >
            <i className="dot"></i>
            Dashboard
          </a>
          <a
            href="#transactions"
            className={activeTab === 'transactions' ? 'active' : ''}
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('transactions');
            }}
          >
            <i className="dot"></i>
            Transactions
          </a>
          <a
            href="#contacts"
            className={activeTab === 'contacts' ? 'active' : ''}
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('contacts');
            }}
          >
            <i className="dot"></i>
            Contacts
          </a>
          <a
            href="#settings"
            className={activeTab === 'settings' ? 'active' : ''}
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('settings');
            }}
          >
            <i className="dot"></i>
            Settings
          </a>
        </nav>

        {/* User profile connection indicator */}
        <div className="bottom cursor-pointer" onClick={handleProfileClick}>
          <div className="person">
            <div className="avatar bg-[#ddd3ff] font-extrabold text-[#17211b]">
              {isConnected ? 'SA' : '??'}
            </div>
            <div>
              <b className="truncate max-w-[120px] text-white">
                {isConnected ? formatShortAddr(walletAddress) : 'Connect Lace'}
              </b>
              <small className="text-slate-400">
                {isConnected ? `${tDustBalance.toLocaleString()} tDUST` : 'Not Connected'}
              </small>
            </div>
          </div>
        </div>
      </aside>

      <LaceWalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
      />
    </>
  );
};
