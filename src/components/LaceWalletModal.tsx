'use client';

import React, { useState } from 'react';
import { useLaceWallet } from '@/lib/lace-wallet-context';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Wallet,
  CheckCircle2,
  Copy,
  ExternalLink,
  Shield,
  Sparkles,
  RefreshCw,
  LogOut,
  Sliders,
  AlertCircle,
  Check,
} from 'lucide-react';

interface LaceWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LaceWalletModal: React.FC<LaceWalletModalProps> = ({ isOpen, onClose }) => {
  const {
    isConnected,
    isConnecting,
    walletAddress,
    shieldedAddress,
    tNightBalance,
    tDustBalance,
    network,
    isSimulatedMode,
    isLaceInstalled,
    error,
    connect,
    disconnect,
    setNetwork,
    toggleSimulatedMode,
  } = useLaceWallet();

  const [copied, setCopied] = useState(false);

  const handleCopyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const truncateAddress = (addr: string | null) => {
    if (!addr) return '';
    return `${addr.substring(0, 14)}...${addr.substring(addr.length - 8)}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md border-indigo-500/40 bg-slate-950/95 text-slate-100 backdrop-blur-2xl">
        <DialogHeader>
          <div className="flex items-center space-x-3 mb-1">
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <DialogTitle className="text-xl">
                Lace Wallet <span className="text-cyan-400">Connectivity</span>
              </DialogTitle>
              <DialogDescription>
                Midnight Blockchain Zero-Knowledge Key Management
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 my-2">
          {/* Connection Error Alert */}
          {error && (
            <div className="p-3 bg-rose-950/70 border border-rose-800/60 rounded-xl text-xs text-rose-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Wallet State Overview */}
          {isConnected ? (
            <div className="space-y-4">
              {/* Status & Address Card */}
              <div className="p-4 bg-slate-900/90 border border-purple-500/30 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                    <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                      Lace Wallet Connected
                    </span>
                  </div>
                  <Badge variant={isSimulatedMode ? 'amber' : 'cyan'}>
                    {isSimulatedMode ? 'Simulated Local Mode' : 'Lace Extension Active'}
                  </Badge>
                </div>

                <div className="space-y-1">
                  <div className="text-[11px] text-slate-400 font-medium">Unshielded Wallet Address</div>
                  <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800 font-mono text-xs text-cyan-300">
                    <span>{truncateAddress(walletAddress)}</span>
                    <button
                      onClick={handleCopyAddress}
                      className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition"
                      title="Copy Address"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {shieldedAddress && (
                  <div className="space-y-1">
                    <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                      <Shield className="w-3 h-3 text-purple-400" /> Shielded Key Commitment
                    </div>
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-purple-900/40 font-mono text-[11px] text-purple-300 truncate">
                      {shieldedAddress}
                    </div>
                  </div>
                )}
              </div>

              {/* Balances Display */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 bg-slate-900/70 border border-indigo-900/40 rounded-xl space-y-1">
                  <div className="text-[11px] text-slate-400 font-medium">tNIGHT Balance</div>
                  <div className="text-lg font-bold text-white font-mono">
                    {tNightBalance.toLocaleString()} <span className="text-xs text-purple-400 font-normal">tNIGHT</span>
                  </div>
                </div>
                <div className="p-3.5 bg-slate-900/70 border border-indigo-900/40 rounded-xl space-y-1">
                  <div className="text-[11px] text-slate-400 font-medium">tDUST ZK Fuel</div>
                  <div className="text-lg font-bold text-cyan-300 font-mono">
                    {tDustBalance.toLocaleString()} <span className="text-xs text-cyan-400 font-normal">tDUST</span>
                  </div>
                </div>
              </div>

              {/* Network Selector */}
              <div className="p-3.5 bg-slate-900/50 border border-slate-800 rounded-xl space-y-2">
                <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Target Midnight Network</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {(['preview', 'devnet', 'preprod'] as const).map((net) => (
                    <button
                      key={net}
                      onClick={() => setNetwork(net)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold capitalize transition border ${
                        network === net
                          ? 'bg-purple-600/30 text-purple-300 border-purple-500/50 shadow'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {net}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Not Connected Info */}
              <div className="p-5 bg-slate-900/80 border border-indigo-900/40 rounded-2xl text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mx-auto text-purple-400">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">Connect Lace for Midnight</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                    Access shielded corporate reimbursements and anonymous governance polls using your Midnight wallet.
                  </p>
                </div>

                {!isLaceInstalled && (
                  <div className="p-3 bg-indigo-950/60 border border-indigo-800/40 rounded-xl text-left text-xs text-slate-300 space-y-1.5">
                    <div className="font-semibold text-cyan-300 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> Note on Lace Extension:
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Lace Extension for Midnight enables browser-based ZK proof generation. Simulated Mode is enabled below so you can test MidRoll dApp immediately!
                    </p>
                  </div>
                )}
              </div>

              {/* Mode Toggle */}
              <div className="flex items-center justify-between p-3 bg-slate-900/60 border border-slate-800 rounded-xl text-xs">
                <span className="text-slate-300 font-medium">Use Local Simulation Mode</span>
                <button
                  onClick={() => toggleSimulatedMode()}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition border ${
                    isSimulatedMode
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  {isSimulatedMode ? 'Simulated Active' : 'Real Extension'}
                </button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          {isConnected ? (
            <Button
              variant="destructive"
              onClick={disconnect}
              className="w-full flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Disconnect Wallet</span>
            </Button>
          ) : (
            <Button
              variant="cyan"
              disabled={isConnecting}
              onClick={connect}
              className="w-full flex items-center justify-center gap-2"
            >
              {isConnecting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Connecting to Lace...</span>
                </>
              ) : (
                <>
                  <Wallet className="w-4 h-4" />
                  <span>Connect Lace Wallet</span>
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
