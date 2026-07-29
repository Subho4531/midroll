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
      <DialogContent className="sm:max-w-md bg-white border border-line text-ink">
        <DialogHeader>
          <div className="flex items-center space-x-3 mb-1">
            <div className="p-2.5 rounded-xl bg-[#eef4ee] border border-line text-ink">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <DialogTitle className="text-xl font-extrabold text-ink">
                Lace Wallet Connectivity
              </DialogTitle>
              <DialogDescription className="text-xs text-muted font-mono uppercase tracking-wider">
                Midnight Blockchain Zero-Knowledge Key Management
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 my-2">
          {/* Connection Error Alert */}
          {error && (
            <div className="p-3 bg-[#ffdbda] border border-[#f3aaa4] rounded-xl text-xs text-[#881337] flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-[#881337] shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Wallet State Overview */}
          {isConnected ? (
            <div className="space-y-4">
              {/* Status & Address Card */}
              <div className="p-4 bg-[#f8faf7] border border-line rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider font-mono">
                      Lace Connected
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#eef4ee] border border-line text-ink font-mono uppercase">
                    {isSimulatedMode ? 'Simulated Mode' : 'Extension Active'}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="text-[11px] text-muted font-mono uppercase">Unshielded Wallet Address</div>
                  <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-line font-mono text-xs text-ink">
                    <span>{truncateAddress(walletAddress)}</span>
                    <button
                      onClick={handleCopyAddress}
                      className="p-1 hover:bg-[#eef4ee] rounded text-muted hover:text-ink transition"
                      title="Copy Address"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {shieldedAddress && (
                  <div className="space-y-1">
                    <div className="text-[11px] text-muted font-mono uppercase flex items-center gap-1">
                      <Shield className="w-3 h-3 text-ink" /> Shielded Key Commitment
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-line font-mono text-[11px] text-ink truncate">
                      {shieldedAddress}
                    </div>
                  </div>
                )}
              </div>

              {/* Balances Display */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 bg-[#f8faf7] border border-line rounded-xl space-y-1">
                  <div className="text-[11px] text-muted font-mono uppercase">tNIGHT Balance</div>
                  <div className="text-lg font-bold text-ink font-mono">
                    {tNightBalance.toLocaleString()} <span className="text-xs text-muted font-normal font-mono">tNIGHT</span>
                  </div>
                </div>
                <div className="p-3.5 bg-[#f8faf7] border border-line rounded-xl space-y-1">
                  <div className="text-[11px] text-muted font-mono uppercase">tDUST ZK Fuel</div>
                  <div className="text-lg font-bold text-ink font-mono">
                    {tDustBalance.toLocaleString()} <span className="text-xs text-muted font-normal font-mono">tDUST</span>
                  </div>
                </div>
              </div>

              {/* Network Selector */}
              <div className="p-3.5 bg-[#f8faf7] border border-line rounded-xl space-y-2">
                <div className="text-xs font-semibold text-ink flex items-center gap-1.5 font-mono uppercase">
                  <Sliders className="w-3.5 h-3.5 text-ink" />
                  <span>Target Midnight Network</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {(['preview', 'devnet', 'preprod'] as const).map((net) => (
                    <button
                      key={net}
                      onClick={() => setNetwork(net)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold capitalize transition border ${
                        network === net
                          ? 'bg-[#eaf1ea] text-ink border-ink font-bold shadow-sm'
                          : 'bg-white text-muted border-line hover:text-ink hover:border-ink'
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
              <div className="p-5 bg-[#f8faf7] border border-line rounded-2xl text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#eef4ee] border border-line flex items-center justify-center mx-auto text-ink">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-ink">Connect Lace for Midnight</h4>
                  <p className="text-xs text-muted mt-1 max-w-xs mx-auto leading-relaxed">
                    Access shielded corporate reimbursements and anonymous governance polls using your Midnight wallet.
                  </p>
                </div>

                {!isLaceInstalled && (
                  <div className="p-3 bg-[#eef4ee] border border-line rounded-xl text-left text-xs text-ink space-y-1.5">
                    <div className="font-semibold text-ink flex items-center gap-1 font-mono uppercase">
                      <Sparkles className="w-3.5 h-3.5" /> Note on Lace Extension:
                    </div>
                    <p className="text-[11px] text-muted">
                      Lace Extension for Midnight enables browser-based ZK proof generation. Simulated Mode is enabled below so you can test MidRoll dApp immediately!
                    </p>
                  </div>
                )}
              </div>

              {/* Mode Toggle */}
              <div className="flex items-center justify-between p-3 bg-[#f8faf7] border border-line rounded-xl text-xs">
                <span className="text-ink font-semibold">Use Local Simulation Mode</span>
                <button
                  onClick={() => toggleSimulatedMode()}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border ${
                    isSimulatedMode
                      ? 'bg-[#c6f6d5] text-[#1c6434] border-[#a3e9b9]'
                      : 'bg-white text-muted border-line hover:text-ink hover:border-ink'
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
              disabled={isConnecting}
              onClick={connect}
              className="w-full flex items-center justify-center gap-2"
              type="submit"
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
