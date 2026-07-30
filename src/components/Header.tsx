'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, CreditCard, Vote, Building2, FileCode, Wallet, CheckCircle2, Home, ChevronLeft } from 'lucide-react';
import { useLaceWallet } from '@/lib/lace-wallet-context';
import { LaceWalletModal } from '@/components/LaceWalletModal';

export type ActiveTab = 'dashboard' | 'transactions' | 'contacts' | 'settings';

interface HeaderProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  activeTab?: ActiveTab;
  setActiveTab?: (tab: ActiveTab) => void;
}

export const Header: React.FC<HeaderProps> = ({ isCollapsed, setIsCollapsed }) => {
  const pathname = usePathname();
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
          <Link href="/dashboard" className="brand cursor-pointer">
            <span className="mark"></span>
            MidRoll
          </Link>
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
          <Link
            href="/dashboard"
            className={pathname === '/dashboard' ? 'active' : ''}
          >
            <i className="dot"></i>
            Dashboard
          </Link>
          <Link
            href="/transactions"
            className={pathname === '/transactions' ? 'active' : ''}
          >
            <i className="dot"></i>
            Transactions
          </Link>
          <Link
            href="/contacts"
            className={pathname === '/contacts' ? 'active' : ''}
          >
            <i className="dot"></i>
            Contacts
          </Link>
          <Link
            href="/settings"
            className={pathname === '/settings' ? 'active' : ''}
          >
            <i className="dot"></i>
            Settings
          </Link>
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
