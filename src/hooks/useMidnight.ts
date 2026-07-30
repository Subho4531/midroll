'use client';

import { useState } from 'react';
import { useLaceWallet } from '@/lib/lace-wallet-context';

export interface CircuitCallResult {
  success: boolean;
  txHash: string | null;
  error: string | null;
  logs: string[];
}

// Helper: find the Lace or 1AM wallet in window.midnight
const findLaceWallet = (): any | null => {
  if (typeof window === 'undefined') return null;
  const win = window as any;
  if (!win.midnight) return null;
  if (win.midnight.mnLace) return win.midnight.mnLace;
  if (win.midnight.lace) return win.midnight.lace;
  if (win.midnight['1am']) return win.midnight['1am'];
  
  const wallets = Object.values(win.midnight) as any[];
  return wallets.find(
    (w) =>
      w?.name?.toLowerCase().includes('lace') ||
      w?.rdns?.toLowerCase().includes('lace') ||
      w?.name?.toLowerCase().includes('1am') ||
      w?.rdns?.toLowerCase().includes('1am')
  ) || wallets[0] || null;
};

const shortAddr = (addr: string) =>
  addr.length > 20 ? `${addr.slice(0, 12)}…${addr.slice(-6)}` : addr;

/**
 * Fetch the latest transaction hash currently indexed by the wallet.
 */
const getLatestTxHash = async (api: any): Promise<string | null> => {
  for (const page of [1, 0]) {
    try {
      const history = await api.getTxHistory(page, 1);
      if (Array.isArray(history) && history.length > 0 && history[0]?.txHash) {
        return history[0].txHash;
      }
    } catch (e) {}
  }
  return null;
};

/**
 * Poll getTxHistory to retrieve the real on-chain tx hash.
 * Only accepts a hash that is different from lastKnownHash.
 */
const pollForTxHash = async (
  api: any,
  lastKnownHash: string | null,
  addLog: (msg: string) => void,
  maxAttempts = 15,
  intervalMs = 2000
): Promise<string> => {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    await new Promise((r) => setTimeout(r, intervalMs));
    try {
      for (const page of [1, 0]) {
        try {
          const history = await api.getTxHistory(page, 1);
          if (Array.isArray(history) && history.length > 0 && history[0]?.txHash) {
            const hash = history[0].txHash;
            if (hash !== lastKnownHash) {
              addLog(`✓ On-chain hash confirmed (attempt ${attempt}/${maxAttempts}): ${hash}`);
              return hash;
            }
          }
        } catch (e) {}
      }
      addLog(`⏳ Waiting for indexer... (${attempt}/${maxAttempts})`);
    } catch (e: any) {
      addLog(`⏳ Indexer not ready yet (${attempt}/${maxAttempts})`);
    }
  }
  throw new Error(
    'Transaction was submitted but the on-chain hash could not be retrieved from the Midnight indexer after multiple retries. Please check your Lace wallet history for the transaction.'
  );
};

/**
 * Helper to submit a transaction defensively.
 * Wraps submission with a timeout to prevent hanging, and tries the wrapped { tx }
 * format first (per README example) before falling back to the raw hex string.
 */
const submitTxHelper = async (api: any, txInput: any): Promise<void> => {
  const rawTx = (txInput && typeof txInput === 'object' && typeof txInput.tx === 'string') ? txInput.tx : txInput;
  const wrappedTx = (typeof txInput === 'string') ? { tx: txInput } : txInput;

  const submitWithTimeout = async (payload: any, ms = 4000): Promise<void> => {
    await Promise.race([
      api.submitTransaction(payload),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms))
    ]);
  };

  try {
    // Attempt 1: Try the wrapped { tx: string } object (as in the official README)
    await submitWithTimeout(wrappedTx, 3500);
  } catch (err: any) {
    // Attempt 2: If it fails or times out, try the raw hex string format
    try {
      await submitWithTimeout(rawTx, 3500);
    } catch (innerErr: any) {
      // If either attempt timed out, we proceed to check the indexer rather than erroring out,
      // since the wallet might have successfully broadcasted it but hung on resolving the promise.
      if (err.message === 'timeout' || innerErr.message === 'timeout') {
        console.warn('submitTransaction timed out on both formats. Proceeding to indexer polling.');
        return;
      }
      throw err;
    }
  }
};

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
  const [txPhase, setTxPhase] = useState<'idle' | 'signing' | 'broadcasting' | 'confirming' | 'done'>('idle');

  const contractAddress = '85dd06179800830b2d181f3238ecf3b94a0ae820bcc62953e50c0f9d26743a7d';

  const callCircuit = async (
    circuitName: 'claim_shielded_expense' | 'cast_shielded_vote' | 'dispatch_payment' | 'dispatch_multi_payment',
    args: any[],
    recipientInfo?: { address?: string; payouts?: { address: string; amount: number }[] }
  ): Promise<CircuitCallResult> => {
    setIsLoading(true);
    setTxPhase('signing');
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

      // Resolve native token type from actual wallet balances
      let tokenType = '0000000000000000000000000000000000000000000000000000000000000000';
      try {
        const balances = await connectedApi.getUnshieldedBalances();
        const keys = Object.keys(balances || {});
        if (keys.length > 0) {
          tokenType = keys[0];
          addLog(`Token type: ${tokenType.slice(0, 8)}…`);
        }
      } catch (e: any) {
        addLog(`⚠️ Token type fetch failed, using default.`);
      }

      let finalTxHash = '';

      if (circuitName === 'dispatch_payment' && recipientInfo?.address) {
        const payAmt = Number(args[1]);
        addLog(`→ Sending ${payAmt} tNIGHT to ${shortAddr(recipientInfo.address)}`);
        addLog('Awaiting Lace wallet signature...');

        // Get the latest transaction hash *before* we submit the new one
        const lastKnownHash = await getLatestTxHash(connectedApi);

        // Per README: makeTransfer receives the array and returns the whole { tx } object.
        const txObject = await connectedApi.makeTransfer([{
          kind: 'unshielded' as const,
          type: tokenType,
          value: BigInt(Math.round(payAmt)) * 1_000_000n,
          recipient: recipientInfo.address,
        }]);

        setTxPhase('broadcasting');
        addLog('Signed. Submitting to Midnight network...');

        // Pass the whole txObject (which is { tx: string }) to submitTxHelper
        await submitTxHelper(connectedApi, txObject);
        
        setTxPhase('confirming');
        addLog('✓ Transaction submitted. Awaiting indexer confirmation...');

        // Poll getTxHistory for the real on-chain hash — only accept different hash
        finalTxHash = await pollForTxHash(connectedApi, lastKnownHash, addLog);

        await wallet.transferDust(payAmt);

      } else if (circuitName === 'dispatch_multi_payment' && recipientInfo?.payouts) {
        const total = recipientInfo.payouts.reduce((s, p) => s + p.amount, 0);
        addLog(`→ Batch: ${recipientInfo.payouts.length} recipients, ${total} tNIGHT total`);
        addLog('Awaiting Lace wallet signature...');

        // Get the latest transaction hash *before* we submit the new one
        const lastKnownHash = await getLatestTxHash(connectedApi);

        const desiredOutputs = recipientInfo.payouts.map((p) => ({
          kind: 'unshielded' as const,
          type: tokenType,
          value: BigInt(Math.round(p.amount)) * 1_000_000n,
          recipient: p.address,
        }));

        // Per README: makeTransfer returns the whole { tx } object.
        const txObject = await connectedApi.makeTransfer(desiredOutputs);

        setTxPhase('broadcasting');
        addLog('Signed. Submitting batch to Midnight network...');

        // Pass the whole txObject to submitTxHelper
        await submitTxHelper(connectedApi, txObject);
        
        setTxPhase('confirming');
        addLog(`✓ Batch submitted (${recipientInfo.payouts.length} recipients). Awaiting indexer confirmation...`);

        // Poll getTxHistory for the real on-chain hash
        finalTxHash = await pollForTxHash(connectedApi, lastKnownHash, addLog);

        await wallet.transferDust(total);

      } else if (circuitName === 'claim_shielded_expense') {
        throw new Error('Shielded expense claims require a deployed Compact contract.');
      } else if (circuitName === 'cast_shielded_vote') {
        throw new Error('Shielded voting requires a deployed Compact contract.');
      }

      addLog(`✓ Finalized on ${wallet.network} · ${finalTxHash.slice(0, 16)}…`);

      setTxPhase('done');
      // Reset txPhase back to idle after 4 seconds to refresh submit buttons
      setTimeout(() => setTxPhase('idle'), 4000);

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
      setTxPhase('idle');
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
    txPhase,
  };
};
