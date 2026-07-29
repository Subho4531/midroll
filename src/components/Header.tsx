'use client';

import React, { useState } from 'react';
import { Shield, CreditCard, Vote, Building2, FileCode, Wallet, CheckCircle2 } from 'lucide-react';
import { useLaceWallet } from '@/lib/lace-wallet-context';
import { LaceWalletModal } from '@/components/LaceWalletModal';

export type ActiveTab = 'expenses' | 'governance' | 'employer' | 'contract';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const { isConnected, walletAddress, tDustBalance, network } = useLaceWallet();
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  const formatShortAddr = (addr: string | null) => {
    if (!addr) return '';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  const handleProfileClick = () => {
    setIsWalletModalOpen(true);
  };

  return (
    <>
      <aside className="sidebar">
        {/* Brand */}
        <div className="brand cursor-pointer" onClick={() => setActiveTab('expenses')}>
          <span className="mark"></span>
          MidRoll
        </div>

        {/* Network / Workspace Selection */}
        <div className="workspace">
          <button onClick={() => setIsWalletModalOpen(true)}>
            {isConnected ? `${network.toUpperCase()} Network` : 'Orbit Labs'}
            <span>⌄</span>
          </button>
        </div>

        {/* Navigation */}
        <nav className="nav">
          <h4>Workspace</h4>
          <a
            href="#expenses"
            className={activeTab === 'expenses' ? 'active' : ''}
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('expenses');
            }}
          >
            <i className="dot"></i>
            Shielded Expenses
          </a>
          <a
            href="#governance"
            className={activeTab === 'governance' ? 'active' : ''}
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('governance');
            }}
          >
            <i className="dot"></i>
            Anonymous Governance
          </a>
          <a
            href="#employer"
            className={activeTab === 'employer' ? 'active' : ''}
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('employer');
            }}
          >
            <i className="dot"></i>
            Employer Portal
          </a>

          <h4>Build</h4>
          <a
            href="#contract"
            className={activeTab === 'contract' ? 'active' : ''}
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('contract');
            }}
          >
            <i className="dot"></i>
            Compact Code
          </a>
        </nav>

        {/* Bottom User Area */}
        <div className="bottom cursor-pointer" onClick={handleProfileClick}>
          <div className="person">
            <div className="avatar bg-[#ddd3ff] font-extrabold text-[#17211b]">
              {isConnected ? 'SA' : '??'}
            </div>
            <div>
              <b className="truncate max-w-[120px]">
                {isConnected ? formatShortAddr(walletAddress) : 'Connect Lace'}
              </b>
              <small>
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
