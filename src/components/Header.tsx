'use client';

import React from 'react';
import { Shield, Zap, Lock, Eye, Building2, Wallet, FileCode, CheckCircle2, ChevronRight, Sparkles, CreditCard } from 'lucide-react';

export type ActiveTab = 'payflow' | 'employer' | 'zk-generator' | 'verifier' | 'expenses' | 'contract';

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
          
          {/* Logo & Network Status */}
          <div className="flex items-center space-x-4">
            <div className="relative group cursor-pointer" onClick={() => setActiveTab('payflow')}>
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-indigo-600 rounded-xl blur opacity-60 group-hover:opacity-100 transition duration-300"></div>
              <div className="relative px-3.5 py-2.5 bg-slate-900 rounded-xl flex items-center space-x-2.5 border border-cyan-500/30">
                <Shield className="w-6 h-6 text-cyan-400 animate-pulse-slow" />
                <span className="text-xl font-extrabold tracking-tight text-white">
                  Mid<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">Zoll</span>
                </span>
              </div>
            </div>

            {/* Network Badge */}
            <div className="hidden md:flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-950/60 border border-indigo-500/30 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
              <span className="text-cyan-300 font-semibold">Midnight Testnet</span>
              <span className="text-slate-400">| Compact ZK v0.12</span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden lg:flex items-center space-x-1">
            <button
              onClick={() => setActiveTab('payflow')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'payflow'
                  ? 'bg-indigo-600/30 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(0,240,255,0.15)]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>My PayFlow</span>
            </button>

            <button
              onClick={() => setActiveTab('employer')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'employer'
                  ? 'bg-indigo-600/30 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(0,240,255,0.15)]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Building2 className="w-4 h-4 text-indigo-400" />
              <span>Employer HR</span>
            </button>

            <button
              onClick={() => setActiveTab('zk-generator')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'zk-generator'
                  ? 'bg-indigo-600/30 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(0,240,255,0.15)]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Lock className="w-4 h-4 text-amber-400" />
              <span>ZK Income Proof</span>
            </button>

            <button
              onClick={() => setActiveTab('verifier')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'verifier'
                  ? 'bg-indigo-600/30 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(0,240,255,0.15)]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Eye className="w-4 h-4 text-emerald-400" />
              <span>Proof Verifier</span>
            </button>

            <button
              onClick={() => setActiveTab('expenses')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'expenses'
                  ? 'bg-indigo-600/30 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(0,240,255,0.15)]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <CreditCard className="w-4 h-4 text-purple-400" />
              <span>ZK Expenses</span>
            </button>

            <button
              onClick={() => setActiveTab('contract')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'contract'
                  ? 'bg-indigo-600/30 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(0,240,255,0.15)]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <FileCode className="w-4 h-4 text-blue-400" />
              <span>Compact DSL</span>
            </button>
          </nav>

          {/* Shielded Wallet Badge */}
          <div className="flex items-center space-x-3">
            <div className="px-4 py-2 bg-slate-900/90 border border-cyan-500/30 rounded-xl flex items-center space-x-3">
              <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
                <Wallet className="w-4 h-4" />
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-white tracking-wide">
                  ${walletBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-[10px] text-cyan-400/90 font-mono">
                  {tDustBalance.toLocaleString()} tDUST
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Mobile Tab Nav Bar */}
      <div className="lg:hidden flex overflow-x-auto px-4 py-2 border-t border-indigo-900/20 space-x-2 no-scrollbar bg-slate-950">
        <button
          onClick={() => setActiveTab('payflow')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
            activeTab === 'payflow' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400'
          }`}
        >
          PayFlow
        </button>
        <button
          onClick={() => setActiveTab('employer')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
            activeTab === 'employer' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400'
          }`}
        >
          Employer HR
        </button>
        <button
          onClick={() => setActiveTab('zk-generator')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
            activeTab === 'zk-generator' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400'
          }`}
        >
          ZK Income Proof
        </button>
        <button
          onClick={() => setActiveTab('verifier')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
            activeTab === 'verifier' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400'
          }`}
        >
          Verifier
        </button>
        <button
          onClick={() => setActiveTab('expenses')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
            activeTab === 'expenses' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400'
          }`}
        >
          Expenses
        </button>
        <button
          onClick={() => setActiveTab('contract')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
            activeTab === 'contract' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400'
          }`}
        >
          Compact Code
        </button>
      </div>
    </header>
  );
};
