'use client';

import React, { useState } from 'react';
import { useLaceWallet } from '@/lib/lace-wallet-context';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wallet, LogOut, CheckCircle2, ShieldAlert, Copy, Check, ExternalLink, Shield } from 'lucide-react';

export const WalletConnect: React.FC = () => {
  const wallet = useLaceWallet();
  const [copied, setCopied] = useState(false);
  const [copiedShielded, setCopiedShielded] = useState(false);

  const handleCopy = () => {
    if (wallet.walletAddress) {
      navigator.clipboard.writeText(wallet.walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyShielded = () => {
    if (wallet.shieldedAddress) {
      navigator.clipboard.writeText(wallet.shieldedAddress);
      setCopiedShielded(true);
      setTimeout(() => setCopiedShielded(false), 2000);
    }
  };

  const truncateAddress = (addr: string | null) => {
    if (!addr) return '';
    return `${addr.substring(0, 16)}...${addr.substring(addr.length - 8)}`;
  };

  return (
    <Card className="card border border-line bg-card shadow-sm hover:border-[#c2ccc4]">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-[#eef4ee] border border-line text-ink rounded-xl">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-base text-ink font-bold">Lace Wallet Connectivity</CardTitle>
            <CardDescription className="text-xs text-muted">
              Midnight DApp Connector Authentication
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {wallet.isConnected ? (
          <div className="space-y-3">
            <div className="p-4 bg-[#f8faf7] border border-line rounded-xl space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Connected
                </span>
                <Badge variant="secondary">
                  Extension Active
                </Badge>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-muted uppercase font-bold tracking-wider font-mono">Unshielded Address</span>
                <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-line font-mono text-xs text-ink">
                  <span className="truncate">{truncateAddress(wallet.walletAddress)}</span>
                  <button
                    onClick={handleCopy}
                    className="p-1 hover:bg-[#eef4ee] rounded text-muted hover:text-ink transition shrink-0 ml-2"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {wallet.shieldedAddress && (
                <div className="space-y-1">
                  <span className="text-[10px] text-muted uppercase font-bold tracking-wider font-mono flex items-center gap-1">
                    <Shield className="w-3 h-3 text-ink" /> Shielded Key
                  </span>
                  <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-line font-mono text-xs text-ink">
                    <span>{truncateAddress(wallet.shieldedAddress)}</span>
                    <button
                      onClick={handleCopyShielded}
                      className="p-1 hover:bg-[#eef4ee] rounded text-muted hover:text-ink transition shrink-0 ml-2"
                      title="Copy Shielded Address"
                    >
                      {copiedShielded ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 bg-[#f8faf7] border border-line rounded-xl">
                <div className="text-[10px] text-muted uppercase font-bold tracking-wider font-mono">tNIGHT Balance</div>
                <div className="font-mono font-bold text-ink mt-1">{wallet.tNightBalance.toLocaleString()} tNIGHT</div>
              </div>
              <div className="p-3 bg-[#f8faf7] border border-line rounded-xl">
                <div className="text-[10px] text-muted uppercase font-bold tracking-wider font-mono">tDUST Fuel</div>
                <div className="font-mono font-bold text-ink mt-1">{wallet.tDustBalance.toLocaleString()} tDUST</div>
              </div>
            </div>

            <Button
              variant="destructive"
              onClick={wallet.disconnect}
              className="w-full gap-2 mt-1"
            >
              <LogOut className="w-4 h-4" />
              <span>Disconnect Wallet</span>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="p-4 bg-[#f8faf7] border border-line rounded-xl text-center text-xs text-muted">
              <ShieldAlert className="w-8 h-8 text-ink/70 mx-auto mb-2 animate-pulse" />
              <p className="font-semibold text-ink">Wallet Disconnected</p>
              <p className="text-[11px] text-muted mt-0.5">Please connect your Lace for Midnight wallet to proceed.</p>
            </div>

            {wallet.error && (
              <div className="p-2.5 bg-[#ffdbda] border border-[#f3aaa4] rounded-xl text-[11px] text-rose-800 text-left font-mono">
                {wallet.error}
              </div>
            )}

            <button
              onClick={wallet.connect}
              disabled={wallet.isConnecting}
              className="new w-full gap-2 h-11 justify-center disabled:opacity-50"
            >
              <Wallet className="w-4 h-4" />
              <span>{wallet.isConnecting ? 'Connecting to Lace...' : 'Connect Lace Wallet'}</span>
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
