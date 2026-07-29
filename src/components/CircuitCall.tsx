'use client';

import React, { useState } from 'react';
import { useMidnight } from '@/hooks/useMidnight';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Sparkles, Terminal, CheckCircle2, RefreshCw, EyeOff, ShieldCheck, Lock } from 'lucide-react';
import confetti from 'canvas-confetti';

export const CircuitCall: React.FC = () => {
  const { callCircuit, isLoading, lastResult, contractAddress, wallet } = useMidnight();
  const [expenseAmount, setExpenseAmount] = useState('250.00');
  const [merchantName, setMerchantName] = useState('OpenAI API Cloud');
  const [secureCardNumber, setSecureCardNumber] = useState('4111-XXXX-XXXX-8821');

  const handleExecuteClaim = async () => {
    if (!wallet.isConnected) {
      alert("Please connect your Lace Wallet first!");
      return;
    }
    const amountVal = Math.round(Number(expenseAmount) * 100);
    const res = await callCircuit('claim_shielded_expense', [amountVal]);
    if (res.success) {
      confetti({ particleCount: 100, spread: 80 });
    }
  };

  return (
    <Card className="card border border-line bg-card shadow-sm hover:border-[#c2ccc4]">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-[#eef4ee] border border-line text-ink rounded-xl">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-base text-ink font-bold">Execute ZK Circuit Call</CardTitle>
            <CardDescription className="text-xs text-muted">
              Contract Address: <code className="text-ink text-[10px] font-mono bg-[#eef4ee] px-1.5 py-0.5 rounded border border-line">{contractAddress}</code>
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Secure Local Input Area */}
        <div className="p-4 bg-[#f8faf7] border border-line rounded-2xl space-y-3 relative overflow-hidden">
          <div className="absolute top-2 right-2 text-muted">
            <EyeOff className="w-4 h-4" />
          </div>
          
          <div className="flex items-center space-x-1.5 text-xs text-ink font-semibold mb-1">
            <Lock className="w-3.5 h-3.5" />
            <span>Private Witness Inputs (Kept off-chain)</span>
          </div>

          <div className="space-y-2">
            <div>
              <label className="block text-[10px] text-muted uppercase font-bold tracking-wider mb-1">Merchant Name (Private)</label>
              <Input
                type="text"
                value={merchantName}
                onChange={(e) => setMerchantName(e.target.value)}
                disabled={isLoading}
                className="h-9 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-muted uppercase font-bold tracking-wider mb-1">Card Number (Private)</label>
                <Input
                  type="text"
                  value={secureCardNumber}
                  onChange={(e) => setSecureCardNumber(e.target.value)}
                  disabled={isLoading}
                  className="h-9 text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] text-muted uppercase font-bold tracking-wider mb-1">Claim Amount ($USD)</label>
                <Input
                  type="number"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  disabled={isLoading}
                  className="h-9 text-xs font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Proved without revealing label */}
        <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#eef4ee] border border-line rounded-xl">
          <div className="flex items-center space-x-2 text-xs text-ink">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold text-[11px] uppercase tracking-wider">
              Proved without revealing your input
            </span>
          </div>
          <span className="text-[10px] text-muted font-mono">BLS12-381 ZK-SNARK</span>
        </div>

        {/* Action Button */}
        <button
          onClick={handleExecuteClaim}
          disabled={isLoading || !wallet.isConnected}
          className="new w-full gap-2 h-11 justify-center disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Generating Groth16 Proof...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-lime" />
              <span>Submit Shielded Claim Circuit</span>
            </>
          )}
        </button>

        {/* Logs & Result Output Console */}
        {lastResult && (
          <div className="p-3 bg-[#fbfcfa] border border-line rounded-xl space-y-2">
            <div className="flex items-center justify-between border-b border-line pb-1.5 mb-1.5">
              <span className="text-xs text-ink font-bold flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-ink" /> Executive Console
              </span>
              <Badge variant={lastResult.success ? 'emerald' : 'rose'} className="text-[10px] py-0 px-1.5 font-mono">
                {lastResult.success ? 'Success' : 'Error'}
              </Badge>
            </div>

            {/* Log list */}
            <div className="max-h-24 overflow-y-auto space-y-1 font-mono text-[10px] text-muted scrollbar-thin">
              {lastResult.logs.map((log, idx) => (
                <div key={idx} className={log.includes('❌') ? 'text-rose' : log.includes('✓') || log.includes('Hash') ? 'text-emerald-700 font-semibold' : ''}>
                  {log}
                </div>
              ))}
            </div>

            {lastResult.txHash && (
              <div className="pt-1.5 border-t border-line flex items-center justify-between text-[10px]">
                <span className="text-muted">On-Chain Tx Hash:</span>
                <span className="font-mono text-ink font-bold select-all bg-[#eef4ee] px-1 rounded">{lastResult.txHash.substring(0, 18)}...</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
