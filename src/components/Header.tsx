'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { useOneAMWallet } from '@/lib/lace-wallet-context';
import { OneAMWalletModal } from '@/components/LaceWalletModal';

export type ActiveTab = 'dashboard' | 'transactions' | 'contacts' | 'settings';

interface HeaderProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  activeTab?: ActiveTab;
  setActiveTab?: (tab: ActiveTab) => void;
}

export const Header: React.FC<HeaderProps> = ({ isCollapsed, setIsCollapsed }) => {
  const pathname = usePathname();
  const { isConnected, walletAddress, tDustBalance, network } = useOneAMWallet();
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

  const networkLabel = network ? `${network.charAt(0).toUpperCase()}${network.slice(1)} network` : 'No network';

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
            className="collapse-btn"
            title="Collapse Sidebar"
            aria-label="Collapse Sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation links */}
        <nav className="nav">
          <Link
            href="/dashboard"
            className={pathname === '/dashboard' ? 'active' : ''}
          >
            Dashboard
          </Link>
          <Link
            href="/transactions"
            className={pathname === '/transactions' ? 'active' : ''}
          >
            Transactions
          </Link>
          <Link
            href="/contacts"
            className={pathname === '/contacts' ? 'active' : ''}
          >
            Contacts
          </Link>
          <Link
            href="/portfolio"
            className={pathname === '/portfolio' ? 'active' : ''}
          >
            Portfolio
          </Link>
          {/* <Link
            href="/settings"
            className={pathname === '/settings' ? 'active' : ''}
          >
            Settings
          </Link> */}
        </nav>

        {/* Network + account controls */}
        <div className="sidebar-foot">
          <div className="net-select">
            <button onClick={() => setIsWalletModalOpen(true)} title="Switch network">
              <span className="truncate">{isConnected ? networkLabel : 'Connect wallet'}</span>
              <span aria-hidden="true">⌄</span>
            </button>
          </div>

          <div className="bottom cursor-pointer" onClick={handleProfileClick} role="button" tabIndex={0}>
            <div className="person">
              <div className="avatar bg-[#ddd3ff] font-extrabold text-[#17211b]">
                {isConnected ? 'SA' : '??'}
              </div>
              <div className="min-w-0">
                <b className="truncate max-w-[120px] text-white">
                  {isConnected ? formatShortAddr(walletAddress) : 'Connect 1AM'}
                </b>
                <small className="text-slate-400">
                  {isConnected ? `${tDustBalance.toLocaleString()} tDUST` : 'Not Connected'}
                </small>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <OneAMWalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
      />
    </>
  );
};
