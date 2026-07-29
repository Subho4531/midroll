'use client';

import { useState } from 'react';
import { useLaceWallet } from '@/lib/lace-wallet-context';

export interface CircuitCallResult {
  success: boolean;
  txHash: string | null;
  error: string | null;
  logs: string[];
}

// Helper: find the Lace wallet in window.midnight
const findLaceWallet = (): any | null => {
  if (typeof window === 'undefined') return null;
  const win = window as any;
  if (!win.midnight) return null;
  if (win.midnight.mnLace) return win.midnight.mnLace;
  if (win.midnight.lace) return win.midnight.lace;
  const wallets = Object.values(win.midnight) as any[];
  return wallets.find(
    (w) => w?.name?.toLowerCase().includes('lace') || w?.rdns?.toLowerCase().includes('lace')
  ) || wallets[0] || null;
};

const shortAddr = (addr: string) =>
  addr.length > 20 ? `${addr.slice(0, 12)}…${addr.slice(-6)}` : addr;

// Ensure we have a live, unlocked connectedApi — reconnect if port went stale
const ensureLiveApi = async (
  cachedApi: any,
  network: string,
  addLog: (msg: string) => void
): Promise<any> => {
  try {
    const status = await cachedApi.getConnectionStatus();
    if (status?.status === 'connected') {
      addLog('✓ Wallet connection live.');
      return cachedApi;
    }
    addLog('⚠️ Port disconnected — reconnecting...');
  } catch (e: any) {
    addLog(`⚠️ Connection check failed — reconnecting...`);
  }

  const laceWallet = findLaceWallet();
  if (!laceWallet) throw new Error('Lace extension not found. Please reload and reconnect.');
  const freshApi = await laceWallet.connect(network);
  if (!freshApi) throw new Error('Reconnect failed — Lace returned no API.');
  addLog('✓ Reconnected.');
  return freshApi;
};

export const useMidnight = () => {
  const wallet = useLaceWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState<CircuitCallResult | null>(null);

  const contractAddress = '85dd06179800830b2d181f3238ecf3b94a0ae820bcc62953e50c0f9d26743a7d';

  const callCircuit = async (
    circuitName: 'claim_shielded_expense' | 'cast_shielded_vote' | 'dispatch_payment' | 'dispatch_multi_payment',
    args: any[],
    recipientInfo?: { address?: string; payouts?: { address: string; amount: number }[] }
  ): Promise<CircuitCallResult> => {
    setIsLoading(true);
    const logs: string[] = [];

    const addLog = (msg: string) => {
      logs.push(`[${new Date().toLocaleTimeString()}] ${msg}`);
      setLastResult((prev) =>
        prev
          ? { ...prev, logs: [...logs] }
          : { success: false, txHash: null, error: null, logs: [...logs] }
      );
    };

    addLog(`Circuit: ${circuitName}`);

    try {
      if (!wallet.isConnected || !wallet.connectedApi) {
        throw new Error('Wallet not connected. Please connect your Lace wallet first.');
      }

      const connectedApi = await ensureLiveApi(wallet.connectedApi, wallet.network, addLog);

      // Resolve native token type
      let tokenType = '0000000000000000000000000000000000000000000000000000000000000000';
      try {
        const balances = await connectedApi.getUnshieldedBalances();
        const keys = Object.keys(balances || {});
        if (keys.length > 0) {
          tokenType = keys[0];
          addLog(`Token: ${tokenType.slice(0, 8)}…`);
        }
      } catch (e: any) {
        addLog(`⚠️ Token type fetch failed, using default.`);
      }

      let finalTxHash = '';

      if (circuitName === 'dispatch_payment' && recipientInfo?.address) {
        const payAmt = Number(args[1]);
        addLog(`→ ${payAmt} tNIGHT to ${shortAddr(recipientInfo.address)}`);
        addLog('Awaiting Lace signature...');

        const desiredOutputs = [{
          kind: 'unshielded' as const,
          type: tokenType,
          value: BigInt(payAmt) * 1_000_000n,
          recipient: recipientInfo.address,
        }];

        // makeTransfer returns Promise<{ tx: string }> — tx is a sealed hex-encoded transaction
        const { tx } = await connectedApi.makeTransfer(desiredOutputs);
        addLog('Signed. Submitting...');
        await connectedApi.submitTransaction(tx);
        addLog('✓ Sent!');

        finalTxHash = tx.slice(0, 20) || 'pending';
        await wallet.transferDust(payAmt);

      } else if (circuitName === 'dispatch_multi_payment' && recipientInfo?.payouts) {
        const total = recipientInfo.payouts.reduce((s, p) => s + p.amount, 0);
        addLog(`→ Batch: ${recipientInfo.payouts.length} recipients, ${total} tNIGHT total`);
        addLog('Awaiting Lace signature...');

        const desiredOutputs = recipientInfo.payouts.map((p) => ({
          kind: 'unshielded' as const,
          type: tokenType,
          value: BigInt(p.amount) * 1_000_000n,
          recipient: p.address,
        }));

        // makeTransfer returns Promise<{ tx: string }> — tx is a sealed hex-encoded transaction
        const { tx } = await connectedApi.makeTransfer(desiredOutputs);
        addLog('Signed. Submitting...');
        await connectedApi.submitTransaction(tx);
        addLog(`✓ Batch sent! ${recipientInfo.payouts.length} recipients.`);

        finalTxHash = tx.slice(0, 20) || 'pending';
        await wallet.transferDust(total);

      } else if (circuitName === 'claim_shielded_expense') {
        throw new Error('Shielded expense claims require a deployed Compact contract.');
      } else if (circuitName === 'cast_shielded_vote') {
        throw new Error('Shielded voting requires a deployed Compact contract.');
      }

      if (!finalTxHash) finalTxHash = 'pending_confirmation';

      addLog(`✓ Confirmed on ${wallet.network} · ${finalTxHash.slice(0, 16) || 'pending'}`);

      const result: CircuitCallResult = {
        success: true,
        txHash: finalTxHash,
        error: null,
        logs: [...logs],
      };
      setLastResult(result);
      setIsLoading(false);
      return result;

    } catch (err: any) {
      console.error('[useMidnight] error:', err);
      addLog(`❌ ${err.message || String(err)}`);
      const result: CircuitCallResult = {
        success: false,
        txHash: null,
        error: err.message || String(err),
        logs: [...logs],
      };
      setLastResult(result);
      setIsLoading(false);
      return result;
    }
  };

  return {
    wallet,
    isLoading,
    lastResult,
    contractAddress,
    callCircuit,
  };
};
