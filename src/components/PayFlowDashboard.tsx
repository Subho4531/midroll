'use client';

import React, { useState, useEffect } from 'react';
import { Zap, ShieldCheck, ArrowUpRight, Lock, Key, Coins, RefreshCw, AlertCircle, Sparkles, CheckCircle2, Sliders } from 'lucide-react';
import { Employee, formatUSD, generateZKHash } from '@/lib/midzoll-zk';
import confetti from 'canvas-confetti';

interface PayFlowDashboardProps {
  employee: Employee;
  onClaimSuccess: (claimedAmountUSD: number) => void;
}

export const PayFlowDashboard: React.FC<PayFlowDashboardProps> = ({
  employee,
  onClaimSuccess,
}) => {
  const [accumulatedUSD, setAccumulatedUSD] = useState<number>(142.85);
  const [claimedTotal, setClaimedTotal] = useState<number>(employee.totalClaimedUSD);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimProgress, setClaimProgress] = useState(0);
  const [stealthAddress, setStealthAddress] = useState('');
  const [lastClaimTxHash, setLastClaimTxHash] = useState<string | null>(null);

  // Auto Split allocations
  const [splitUSDC, setSplitUSDC] = useState(70);
  const [splitNight, setSplitNight] = useState(20);
  const [splitYield, setSplitYield] = useState(10);

  // Per-second stream ticker effect
  useEffect(() => {
    const interval = setInterval(() => {
      setAccumulatedUSD((prev) => prev + employee.streamVelocitySec);
    }, 100);
    return () => clearInterval(interval);
  }, [employee.streamVelocitySec]);

  // Handle ZK Claim Action
  const handleInitiateClaim = () => {
    setStealthAddress(generateZKHash('0xstealth_night'));
    setIsClaimModalOpen(true);
  };

  const handleExecuteZKClaim = () => {
    setIsClaiming(true);
    setClaimProgress(10);

    const step1 = setTimeout(() => setClaimProgress(40), 600);
    const step2 = setTimeout(() => setClaimProgress(75), 1200);
    const step3 = setTimeout(() => {
      setClaimProgress(100);
      setIsClaiming(false);
      const amountToClaim = accumulatedUSD;
      setClaimedTotal((prev) => prev + amountToClaim);
      onClaimSuccess(amountToClaim);
      setLastClaimTxHash(generateZKHash('0xzk_tx_claim'));
      setAccumulatedUSD(0.00);

      // Trigger celebration confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }, 1800);

    return () => {
      clearTimeout(step1);
      clearTimeout(step2);
      clearTimeout(step3);
    };
  };

  const taxAmountUSD = (accumulatedUSD * employee.taxRateBasisPoints) / 10000;
  const netTakeHomeUSD = accumulatedUSD - taxAmountUSD;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner / Welcome */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl relative overflow-hidden border border-cyan-500/30">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/40 text-cyan-300 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                Active PayFlow Stream
              </span>
              <span className="text-xs text-slate-400 font-mono">ID: {employee.id}</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Welcome back, <span className="text-gradient-cyan">{employee.name}</span>
            </h1>
            <p className="text-sm text-slate-300 mt-1">
              {employee.role} &bull; <span className="text-cyan-400 font-medium">{employee.department}</span>
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-slate-900/80 p-3 rounded-xl border border-indigo-900/40">
            <ShieldCheck className="w-8 h-8 text-cyan-400 shrink-0" />
            <div>
              <div className="text-xs font-semibold text-slate-300">Midnight Shield Protocol</div>
              <div className="text-[11px] text-slate-400">Zero-Knowledge State Locks Active</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Ticker Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Real-Time Stream Widget */}
        <div className="lg:col-span-2 glass-panel-glow p-6 sm:p-8 rounded-2xl relative scanline-effect border border-cyan-500/40">
          <div className="flex items-center justify-between border-b border-indigo-900/40 pb-4 mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-cyan-500/15 rounded-xl border border-cyan-500/30">
                <Zap className="w-6 h-6 text-cyan-400 animate-bounce" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Unclaimed Real-Time Salary</h2>
                <p className="text-xs text-slate-400">Accruing live on Midnight sidechain per block</p>
              </div>
            </div>
            <div className="text-right font-mono text-xs text-cyan-400 bg-cyan-950/50 px-3 py-1.5 rounded-lg border border-cyan-800/40">
              +${(employee.streamVelocitySec * 3600).toFixed(2)}/hr
            </div>
          </div>

          {/* Big Dynamic Counter */}
          <div className="text-center py-6">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">
              Live Accumulated Net Earnings
            </div>
            <div className="text-5xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-cyan-400 font-mono tracking-tight drop-shadow-[0_0_25px_rgba(0,240,255,0.4)]">
              {formatUSD(accumulatedUSD, 4)}
            </div>

            {/* Sub breakdown */}
            <div className="mt-4 flex items-center justify-center space-x-6 text-xs font-medium">
              <div className="text-slate-400">
                Gross: <span className="text-white font-mono">{formatUSD(accumulatedUSD, 2)}</span>
              </div>
              <div className="text-slate-400">
                Shielded Tax ({(employee.taxRateBasisPoints / 100).toFixed(0)}%):{' '}
                <span className="text-amber-400 font-mono">{formatUSD(taxAmountUSD, 2)}</span>
              </div>
              <div className="text-slate-400">
                Est. Net: <span className="text-emerald-400 font-mono">{formatUSD(netTakeHomeUSD, 2)}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-indigo-900/40">
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <Lock className="w-4 h-4 text-cyan-400" />
              <span>Withdrawals are routed to un-linkable stealth addresses</span>
            </div>

            <button
              onClick={handleInitiateClaim}
              disabled={accumulatedUSD <= 0.05}
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <ArrowUpRight className="w-5 h-5" />
              <span>Claim to Stealth Address</span>
            </button>
          </div>
        </div>

        {/* Right Col: Stream Breakdown & Split Allocator */}
        <div className="space-y-6">
          
          {/* Card: Total Stats */}
          <div className="glass-panel p-6 rounded-2xl border border-indigo-900/40">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center justify-between">
              <span>Payroll Stream Overview</span>
              <Coins className="w-4 h-4 text-cyan-400" />
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Monthly Contract Rate:</span>
                <span className="text-white font-semibold font-mono">{formatUSD(employee.salaryMonthly)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Total Claimed to Date:</span>
                <span className="text-cyan-300 font-semibold font-mono">{formatUSD(claimedTotal)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Viewing Key Status:</span>
                <span className="text-emerald-400 text-xs font-mono bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                  Active (Encrypted)
                </span>
              </div>
            </div>
          </div>

          {/* Card: Auto Split Settings */}
          <div className="glass-panel p-6 rounded-2xl border border-indigo-900/40">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <span>Stealth Split Allocation</span>
              </h3>
              <span className="text-[10px] text-cyan-400 font-mono">100% Total</span>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>USDC-M (Confidential Stablecoin)</span>
                  <span className="font-mono text-cyan-400 font-bold">{splitUSDC}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={splitUSDC}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setSplitUSDC(val);
                    setSplitNight(Math.max(0, 100 - val - splitYield));
                  }}
                  className="w-full accent-cyan-400 bg-slate-800 rounded-lg cursor-pointer h-1.5"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>NIGHT Token (Midnight Native)</span>
                  <span className="font-mono text-indigo-400 font-bold">{splitNight}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={splitNight}
                  onChange={(e) => setSplitNight(Number(e.target.value))}
                  className="w-full accent-indigo-400 bg-slate-800 rounded-lg cursor-pointer h-1.5"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>ZK Shielded Pension Vault (4.8% APY)</span>
                  <span className="font-mono text-emerald-400 font-bold">{splitYield}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={splitYield}
                  onChange={(e) => setSplitYield(Number(e.target.value))}
                  className="w-full accent-emerald-400 bg-slate-800 rounded-lg cursor-pointer h-1.5"
                />
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Claim Modal */}
      {isClaimModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="glass-panel-glow max-w-lg w-full p-6 sm:p-8 rounded-2xl border border-cyan-500/50 shadow-2xl relative">
            <div className="flex justify-between items-center pb-4 border-b border-indigo-900/40">
              <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                <ShieldCheck className="w-6 h-6 text-cyan-400" />
                <span>Midnight ZK Stream Claim</span>
              </h3>
              <button
                onClick={() => !isClaiming && setIsClaimModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            {lastClaimTxHash && claimProgress === 100 ? (
              <div className="py-6 space-y-4 text-center">
                <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/40">
                  <CheckCircle2 className="w-10 h-10 animate-bounce" />
                </div>
                <h4 className="text-xl font-extrabold text-white">Shielded Claim Successful!</h4>
                <p className="text-sm text-slate-300">
                  Funds transferred anonymously to disposable stealth address with zero linkability.
                </p>

                <div className="p-4 bg-slate-900/90 rounded-xl border border-indigo-900/50 text-left space-y-2 text-xs font-mono">
                  <div className="text-slate-400">Stealth Recipient PK:</div>
                  <div className="text-cyan-300 break-all">{stealthAddress}</div>
                  <div className="text-slate-400 mt-2">ZK Nullifier Hash:</div>
                  <div className="text-emerald-400 break-all">{lastClaimTxHash}</div>
                </div>

                <button
                  onClick={() => setIsClaimModalOpen(false)}
                  className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition cursor-pointer"
                >
                  Done & Back to Dashboard
                </button>
              </div>
            ) : (
              <div className="py-6 space-y-6">
                <div className="bg-slate-900/90 p-4 rounded-xl border border-cyan-500/20 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Net Claim Amount:</span>
                    <span className="text-cyan-400 font-bold font-mono">{formatUSD(accumulatedUSD, 4)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Generated Stealth PK:</span>
                    <span className="text-slate-200 font-mono">{stealthAddress.substring(0, 18)}...</span>
                  </div>
                </div>

                {isClaiming && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-cyan-400 font-semibold">
                      <span>Synthesizing Groth16 ZK-SNARK Proof...</span>
                      <span>{claimProgress}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-cyan-500/30">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500 transition-all duration-500"
                        style={{ width: `${claimProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-[11px] text-slate-400 italic text-center">
                      Evaluating nullifier uniqueness and Midnight sidechain witness soundness
                    </p>
                  </div>
                )}

                <div className="flex space-x-3">
                  <button
                    disabled={isClaiming}
                    onClick={() => setIsClaimModalOpen(false)}
                    className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold rounded-xl border border-slate-700 cursor-pointer disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={isClaiming}
                    onClick={handleExecuteZKClaim}
                    className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/30 cursor-pointer disabled:opacity-50"
                  >
                    {isClaiming ? 'Generating ZK Proof...' : 'Confirm & Claim'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
