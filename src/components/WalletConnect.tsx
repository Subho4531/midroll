'use client';

import React, { useState } from 'react';
import { useMidnight } from '@/hooks/useMidnight';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wallet, LogOut, CheckCircle2, ShieldAlert, Copy, Check, ExternalLink, Shield } from 'lucide-react';

export const WalletConnect: React.FC = () => {
  const { wallet } = useMidnight();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (wallet.walletAddress) {
      navigator.clipboard.writeText(wallet.walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const truncateAddress = (addr: string | null) => {
    if (!addr) return '';
    return `${addr.substring(0, 16)}...${addr.substring(addr.length - 8)}`;
  };

  return (
    <Card className="border-indigo-900/40 bg-slate-950/70 shadow-xl backdrop-blur-xl hover:border-purple-500/30">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-purple-500/10 border border-purple-500/30 text-purple-400 rounded-xl">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-base text-white">Lace Wallet Connectivity</CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Midnight DApp Connector Authentication
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {wallet.isConnected ? (
          <div className="space-y-3">
            <div className="p-4 bg-slate-900/90 border border-purple-500/30 rounded-xl space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Connected
                </span>
                <Badge variant={wallet.isSimulatedMode ? 'amber' : 'cyan'}>
                  {wallet.isSimulatedMode ? 'Simulated' : 'Extension'}
                </Badge>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Unshielded Address</span>
                <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-mono text-xs text-cyan-300">
                  <span className="truncate">{truncateAddress(wallet.walletAddress)}</span>
                  <button
                    onClick={handleCopy}
                    className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition shrink-0 ml-2"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {wallet.shieldedAddress && (
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider flex items-center gap-1">
                    <Shield className="w-3 h-3 text-purple-400" /> Shielded Key
                  </span>
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-purple-900/40 font-mono text-[10px] text-purple-300 truncate">
                    {wallet.shieldedAddress}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">tNIGHT Balance</div>
                <div className="font-mono font-bold text-white mt-1">{wallet.tNightBalance.toLocaleString()} tNIGHT</div>
              </div>
              <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">tDUST Fuel</div>
                <div className="font-mono font-bold text-cyan-300 mt-1">{wallet.tDustBalance.toLocaleString()} tDUST</div>
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
            <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl text-center text-xs text-slate-400">
              <ShieldAlert className="w-8 h-8 text-amber-500/80 mx-auto mb-2 animate-pulse" />
              <p className="font-medium text-slate-300">Wallet Disconnected</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Please connect your Lace for Midnight wallet to proceed.</p>
            </div>

            {wallet.error && (
              <div className="p-2.5 bg-rose-950/80 border border-rose-800/60 rounded-xl text-[11px] text-rose-300 text-left">
                {wallet.error}
              </div>
            )}

            <Button
              variant="cyan"
              onClick={wallet.connect}
              disabled={wallet.isConnecting}
              className="w-full gap-2 h-11"
            >
              <Wallet className="w-4 h-4" />
              <span>{wallet.isConnecting ? 'Connecting to Lace...' : 'Connect Lace Wallet'}</span>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
