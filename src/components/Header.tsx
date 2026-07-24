'use client';

import React from 'react';
import { Shield, CreditCard, Vote, Lock, Building2, Wallet, FileCode, Sparkles } from 'lucide-react';

export type ActiveTab = 'expenses' | 'governance' | 'employer' | 'contract';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  walletBalance: number;
  tDustBalance: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  walletBalance,
  tDustBalance,
}) => {
  return (
    <header className="sticky top-0 z-50 border-b border-indigo-900/30 glass-panel bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Midnight Badge */}
          <div className="flex items-center space-x-4">
            <div className="relative group cursor-pointer" onClick={() => setActiveTab('expenses')}>
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 via-cyan-500 to-indigo-600 rounded-xl blur opacity-60 group-hover:opacity-100 transition duration-300"></div>
              <div className="relative px-3.5 py-2.5 bg-slate-900 rounded-xl flex items-center space-x-2.5 border border-purple-500/30">
                <Shield className="w-6 h-6 text-purple-400 animate-pulse-slow" />
                <span className="text-xl font-extrabold tracking-tight text-white">
                  Mid<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">Roll</span>
                </span>
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-950/60 border border-indigo-500/30 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
              <span className="text-cyan-300 font-semibold">Midnight Testnet</span>
              <span className="text-slate-400">| Compact DSL v0.12</span>
            </div>
          </div>

          {/* Core Feature Tabs */}
          <nav className="hidden md:flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('expenses')}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'expenses'
                  ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <CreditCard className="w-4 h-4 text-purple-400" />
              <span>Feature 5: Shielded Expenses</span>
            </button>

            <button
              onClick={() => setActiveTab('governance')}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'governance'
                  ? 'bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Vote className="w-4 h-4 text-cyan-400" />
              <span>Feature 6: Anonymous Governance</span>
            </button>

            <button
              onClick={() => setActiveTab('employer')}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'employer'
                  ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Building2 className="w-4 h-4 text-indigo-400" />
              <span>Employer Roster</span>
            </button>

            <button
              onClick={() => setActiveTab('contract')}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'contract'
                  ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <FileCode className="w-4 h-4 text-blue-400" />
              <span>Compact DSL Source</span>
            </button>
          </nav>

          {/* Shielded Wallet Badge */}
          <div className="flex items-center space-x-3">
            <div className="px-4 py-2 bg-slate-900/90 border border-purple-500/30 rounded-xl flex items-center space-x-3">
              <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
                <Wallet className="w-4 h-4" />
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-white tracking-wide">
                  ${walletBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-[10px] text-purple-400/90 font-mono">
                  {tDustBalance.toLocaleString()} tDUST
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
};
