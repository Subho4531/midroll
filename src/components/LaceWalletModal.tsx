'use client';

import React, { useState } from 'react';
import { useOneAMWallet } from '@/lib/lace-wallet-context';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Wallet,
  Shield,
  Sparkles,
  RefreshCw,
  LogOut,
  Sliders,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';
import { OneAMLogo } from '@/components/OneAMLogo';

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
    is1AMInstalled,
    error,
    connect,
    disconnect,
    setNetwork,
  } = useOneAMWallet();

  const [copied, setCopied] = useState(false);
  const [copiedShielded, setCopiedShielded] = useState(false);

  const handleCopyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyShielded = () => {
    if (shieldedAddress) {
      navigator.clipboard.writeText(shieldedAddress);
      setCopiedShielded(true);
      setTimeout(() => setCopiedShielded(false), 2000);
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
            <OneAMLogo size="lg" />
            <div>
              <DialogTitle className="text-xl font-extrabold text-ink flex items-center gap-2">
                1AM Wallet
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-[#d7ff65]/20 text-[#17211b] border border-[#d7ff65]/40 uppercase">
                  Midnight
                </span>
              </DialogTitle>
              <DialogDescription className="text-xs text-muted font-mono uppercase tracking-wider">
                Midnight Blockchain · Zero-Knowledge Payments
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 my-2">
          {/* Error Alert */}
          {error && (
            <div className="p-3 bg-[#ffdbda] border border-[#f3aaa4] rounded-xl text-xs text-[#881337] flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-[#881337] shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {isConnected ? (
            <div className="space-y-4">
              {/* Status & Address Card */}
              <div className="p-4 bg-[#f8faf7] border border-line rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider font-mono">
                      Connected
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#eef4ee] border border-line text-ink font-mono uppercase">
                    1AM Extension Active
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-muted font-semibold">
                    Unshielded Transparent Address
                  </div>
                  <div className="flex items-center justify-between bg-white border border-line rounded-xl px-3 py-2 text-xs font-mono text-ink">
                    <span className="truncate">{truncateAddress(walletAddress)}</span>
                    <button
                      onClick={handleCopyAddress}
                      className="ml-2 p-1 hover:bg-[#eef4ee] rounded-md transition text-muted hover:text-ink shrink-0"
                      title="Copy Address"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {shieldedAddress && (
                  <div className="space-y-1">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-muted font-semibold flex items-center gap-1">
                      <Shield className="w-3 h-3 text-ink" /> Shielded Key Commitment
                    </div>
                    <div className="flex items-center justify-between bg-white border border-line rounded-xl px-3 py-2 text-xs font-mono text-ink">
                      <span className="truncate">{truncateAddress(shieldedAddress)}</span>
                      <button
                        onClick={handleCopyShielded}
                        className="ml-2 p-1 hover:bg-[#eef4ee] rounded-md transition text-muted hover:text-ink shrink-0"
                        title="Copy Shielded Address"
                      >
                        {copiedShielded ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Balances Card */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-[#f8faf7] border border-line rounded-xl">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-muted font-semibold">
                    tNIGHT Balance
                  </div>
                  <div className="text-sm font-bold text-ink mt-0.5 font-mono">
                    {tNightBalance.toLocaleString()} tNIGHT
                  </div>
                  <div className="text-[9px] text-muted font-mono mt-0.5">Unshielded Native</div>
                </div>

                <div className="p-3 bg-[#f8faf7] border border-line rounded-xl">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-muted font-semibold">
                    tDUST Fuel
                  </div>
                  <div className="text-sm font-bold text-ink mt-0.5 font-mono">
                    {tDustBalance.toLocaleString()} tDUST
                  </div>
                  <div className="text-[9px] text-muted font-mono mt-0.5">Gas / Fee Reserve</div>
                </div>
              </div>

              {/* Network Switcher */}
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
              {/* Not Connected Panel */}
              <div className="p-5 bg-[#f8faf7] border border-line rounded-2xl text-center space-y-3">
                <OneAMLogo size="xl" className="mx-auto" />
                <div>
                  <h4 className="text-base font-extrabold text-ink">Connect 1AM for Midnight</h4>
                  <p className="text-xs text-muted mt-1 max-w-xs mx-auto leading-relaxed">
                    Unlock your 1AM extension first, then click Connect. Your wallet will prompt for authorisation.
                  </p>
                </div>

                {!is1AMInstalled && (
                  <div className="p-3 bg-[#eef4ee] border border-line rounded-xl text-left text-xs text-ink space-y-1.5">
                    <div className="font-semibold text-ink flex items-center gap-1 font-mono uppercase">
                      <Sparkles className="w-3.5 h-3.5" /> 1AM wallet not detected
                    </div>
                    <p className="text-[11px] text-muted">
                      Install the Midnight 1AM browser extension to use real on-chain ZK payments.
                    </p>
                  </div>
                )}

                {is1AMInstalled && (
                  <div className="p-3 bg-[#eef4ee] border border-line rounded-xl text-left text-xs space-y-1">
                    <div className="font-semibold text-emerald-800 flex items-center gap-1 font-mono uppercase">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> 1AM wallet detected
                    </div>
                    <p className="text-[11px] text-muted">
                      Make sure your wallet is unlocked before clicking Connect below.
                    </p>
                  </div>
                )}
              </div>

              {/* Network Selector (pre-connect) */}
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
              disabled={isConnecting || !is1AMInstalled}
              onClick={() => connect()}
              className="w-full flex items-center justify-center gap-2 bg-[#17211b] hover:bg-[#25332b] text-white"
              type="submit"
            >
              {isConnecting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Connecting to 1AM Wallet...</span>
                </>
              ) : !is1AMInstalled ? (
                <>
                  <OneAMLogo size="sm" />
                  <span>1AM Wallet Not Detected</span>
                </>
              ) : (
                <>
                  <OneAMLogo size="sm" />
                  <span>Connect 1AM Wallet</span>
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Backwards-compatible alias
export const OneAMWalletModal = LaceWalletModal;
