'use client';

import React, { useState } from 'react';
import { Shield, CreditCard, Vote, Building2, FileCode, Wallet, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLaceWallet } from '@/lib/lace-wallet-context';
import { LaceWalletModal } from '@/components/LaceWalletModal';

export type ActiveTab = 'expenses' | 'governance' | 'employer' | 'contract';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const { isConnected, walletAddress, tDustBalance, tNightBalance, network, connect } = useLaceWallet();
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  const formatShortAddr = (addr: string | null) => {
    if (!addr) return '';
    return `${addr.substring(0, 8)}...${addr.substring(addr.length - 6)}`;
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-indigo-900/40 bg-slate-950/80 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Logo & Network Badge */}
            <div className="flex items-center space-x-4">
              <div
                className="relative group cursor-pointer"
                onClick={() => setActiveTab('expenses')}
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 via-cyan-500 to-indigo-600 rounded-2xl blur opacity-60 group-hover:opacity-100 transition duration-300"></div>
                <div className="relative px-3.5 py-2.5 bg-slate-900/90 rounded-2xl flex items-center space-x-2.5 border border-purple-500/30">
                  <Shield className="w-6 h-6 text-purple-400 animate-pulse-slow" />
                  <span className="text-xl font-extrabold tracking-tight text-white">
                    Mid<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">Roll</span>
                  </span>
                </div>
              </div>

              <div className="hidden lg:flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-950/60 border border-indigo-500/30 text-xs">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                <span className="text-cyan-300 font-semibold uppercase tracking-wider">{network} Network</span>
                <span className="text-slate-500">| Compact DSL v0.23</span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="hidden md:flex items-center space-x-1.5 p-1 bg-slate-900/80 rounded-2xl border border-indigo-900/40">
              <Button
                variant={activeTab === 'expenses' ? 'purple' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('expenses')}
                className="gap-2"
              >
                <CreditCard className="w-4 h-4" />
                <span>Shielded Expenses</span>
              </Button>

              <Button
                variant={activeTab === 'governance' ? 'cyan' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('governance')}
                className="gap-2"
              >
                <Vote className="w-4 h-4" />
                <span>Anonymous Governance</span>
              </Button>

              <Button
                variant={activeTab === 'employer' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('employer')}
                className="gap-2"
              >
                <Building2 className="w-4 h-4 text-indigo-400" />
                <span>Employer Roster</span>
              </Button>

              <Button
                variant={activeTab === 'contract' ? 'outline' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('contract')}
                className="gap-2"
              >
                <FileCode className="w-4 h-4 text-blue-400" />
                <span>Compact Code</span>
              </Button>
            </nav>

            {/* Lace Wallet Connect Button */}
            <div className="flex items-center space-x-3">
              {isConnected ? (
                <Button
                  variant="glass"
                  onClick={() => setIsWalletModalOpen(true)}
                  className="gap-3 border-purple-500/40 hover:border-purple-400"
                >
                  <div className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="text-left font-mono">
                    <div className="text-xs font-bold text-slate-100">
                      {formatShortAddr(walletAddress)}
                    </div>
                    <div className="text-[10px] text-purple-400 flex items-center gap-1">
                      <span>{tDustBalance.toLocaleString()} tDUST</span>
                    </div>
                  </div>
                </Button>
              ) : (
                <Button
                  variant="cyan"
                  onClick={() => setIsWalletModalOpen(true)}
                  className="gap-2"
                >
                  <Wallet className="w-4 h-4" />
                  <span>Connect Lace Wallet</span>
                </Button>
              )}
            </div>

          </div>
        </div>
      </header>

      <LaceWalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
      />
    </>
  );
};
