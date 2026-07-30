'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type MidnightNetwork = 'preview' | 'devnet' | 'preprod';

export interface LaceWalletState {
  isConnected: boolean;
  isConnecting: boolean;
  walletAddress: string | null;
  shieldedAddress: string | null;
  tNightBalance: number;
  tDustBalance: number;
  shieldedBalance: number;
  network: MidnightNetwork;
  isLaceInstalled: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  setNetwork: (net: MidnightNetwork) => void;
  transferDust: (amount: number) => Promise<void>;
  transferShielded: (amount: number) => Promise<void>;
  connectedApi: any | null;
}

const LaceWalletContext = createContext<LaceWalletState | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'midroll_lace_wallet_state_v2';

// Helper: find the Lace or 1AM wallet in window.midnight
const findLaceWallet = (): any | null => {
  if (typeof window === 'undefined') return null;
  const win = window as any;
  if (!win.midnight) return null;
  // Prefer the known Midnight Lace/1AM keys
  if (win.midnight.mnLace) return win.midnight.mnLace;
  if (win.midnight.lace) return win.midnight.lace;
  if (win.midnight['1am']) return win.midnight['1am'];
  
  // CAIP-372 UUID keys — find by name/rdns/brand
  const wallets = Object.values(win.midnight) as any[];
  return wallets.find(
    (w) =>
      w?.name?.toLowerCase().includes('lace') ||
      w?.rdns?.toLowerCase().includes('lace') ||
      w?.name?.toLowerCase().includes('1am') ||
      w?.rdns?.toLowerCase().includes('1am')
  ) || wallets[0] || null;
};

export const LaceWalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [shieldedAddress, setShieldedAddress] = useState<string | null>(null);
  const [tNightBalance, setTNightBalance] = useState<number>(0);
  const [tDustBalance, setTDustBalance] = useState<number>(0);
  const [shieldedBalance, setShieldedBalance] = useState<number>(0);
  const [network, setNetworkState] = useState<MidnightNetwork>('preview');
  const [isLaceInstalled, setIsLaceInstalled] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectedApi, setConnectedApi] = useState<any | null>(null);

  // Poll for Lace extension presence every second
  useEffect(() => {
    const check = () => {
      const lace = findLaceWallet();
      setIsLaceInstalled(!!lace);
    };
    check();
    const id = setInterval(check, 1000);
    return () => clearInterval(id);
  }, []);

  // Restore network preference and wasConnected state from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const savedNetwork = parsed.network || 'preview';
        setNetworkState(savedNetwork);
        if (parsed.wasConnected) {
          // Trigger auto-connect once on mount after brief extension injection pause
          setTimeout(() => {
            connect(savedNetwork).catch((err) => {
              console.warn('Silent auto-connect failed:', err);
            });
          }, 800);
        }
      }
    } catch (e) {
      // ignore
    }
  }, []);

  // Persist network preference and wasConnected status
  useEffect(() => {
    try {
      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify({ network, wasConnected: isConnected })
      );
    } catch (e) {
      // ignore
    }
  }, [network, isConnected]);

  const connect = async (networkOverride?: MidnightNetwork) => {
    setIsConnecting(true);
    setError(null);
    const activeNetwork = networkOverride || network;

    try {
      const laceWallet = findLaceWallet();

      if (!laceWallet) {
        throw new Error(
          'Lace wallet extension not found. Please install the Midnight Lace extension and refresh.'
        );
      }

      // Connect — this triggers the Lace unlock/authorize popup if wallet is locked
      let api: any;
      if (typeof laceWallet.connect === 'function') {
        api = await laceWallet.connect(activeNetwork);
      } else if (typeof laceWallet.enable === 'function') {
        api = await laceWallet.enable();
      } else {
        throw new Error('Lace wallet does not expose a connect() or enable() method.');
      }

      if (!api) {
        throw new Error('Lace wallet returned no API. The connection was rejected or timed out.');
      }

      // Verify wallet is actually unlocked by fetching the unshielded address.
      // This will throw "Wallet is locked" if the user hasn't unlocked yet.
      const addrRes = await api.getUnshieldedAddress();
      const unshieldedAddress = addrRes?.unshieldedAddress ?? addrRes ?? null;
      if (!unshieldedAddress) {
        throw new Error('Could not read wallet address. Please ensure your wallet is unlocked.');
      }

      // Fetch shielded address
      let shield: string | null = null;
      try {
        const shRes = await api.getShieldedAddresses();
        shield = shRes?.shieldedAddress ?? null;
      } catch (e: any) {
        console.warn('getShieldedAddresses failed:', e.message);
      }

      // Fetch DUST balance
      let dust = 0;
      try {
        const dustRes = await api.getDustBalance();
        const raw = dustRes?.balance !== undefined ? Number(dustRes.balance) : Number(dustRes);
        dust = raw / 1_000_000_000;
      } catch (e: any) {
        console.warn('getDustBalance failed:', e.message);
      }

      // Fetch tNIGHT (unshielded) balance
      let tNight = 0;
      try {
        const unshieldedBals = await api.getUnshieldedBalances();
        const vals = Object.values(unshieldedBals || {});
        if (vals.length > 0) tNight = Number(vals[0]) / 1_000_000;
      } catch (e: any) {
        console.warn('getUnshieldedBalances failed:', e.message);
      }

      // Fetch shielded balance
      let shieldedBal = 0;
      try {
        const shieldedBals = await api.getShieldedBalances();
        const vals = Object.values(shieldedBals || {});
        if (vals.length > 0) shieldedBal = Number(vals[0]) / 1_000_000;
      } catch (e: any) {
        console.warn('getShieldedBalances failed:', e.message);
      }

      setConnectedApi(api);
      setWalletAddress(unshieldedAddress);
      setShieldedAddress(shield);
      setTDustBalance(dust);
      setTNightBalance(tNight);
      setShieldedBalance(shieldedBal);
      setIsConnected(true);
    } catch (err: any) {
      const msg: string = err?.message || String(err);
      // Surface locked wallet error clearly in the UI
      if (msg.toLowerCase().includes('locked')) {
        setError('Wallet is locked. Please click the Lace extension icon and unlock it first.');
      } else if (msg.toLowerCase().includes('rejected') || msg.toLowerCase().includes('user denied')) {
        setError('Connection rejected. Please approve the connection in the Lace wallet popup.');
      } else {
        setError(msg);
      }
      console.error('Lace connect error:', err);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setIsConnected(false);
    setConnectedApi(null);
    setWalletAddress(null);
    setShieldedAddress(null);
    setTNightBalance(0);
    setTDustBalance(0);
    setShieldedBalance(0);
    setError(null);
  };

  const setNetwork = (net: MidnightNetwork) => {
    setNetworkState(net);
    // If connected, disconnect so user has to reconnect on the new network
    if (isConnected) {
      disconnect();
    }
  };

  const transferDust = async (amount: number) => {
    setTDustBalance((prev) => Math.max(0, prev - amount));
  };

  const transferShielded = async (amount: number) => {
    setShieldedBalance((prev) => Math.max(0, prev - amount));
  };

  return (
    <LaceWalletContext.Provider
      value={{
        isConnected,
        isConnecting,
        walletAddress,
        shieldedAddress,
        tNightBalance,
        tDustBalance,
        shieldedBalance,
        network,
        isLaceInstalled,
        error,
        connect,
        disconnect,
        setNetwork,
        transferDust,
        transferShielded,
        connectedApi,
      }}
    >
      {children}
    </LaceWalletContext.Provider>
  );
};

export const useLaceWallet = () => {
  const context = useContext(LaceWalletContext);
  if (!context) {
    throw new Error('useLaceWallet must be used within a LaceWalletProvider');
  }
  return context;
};
