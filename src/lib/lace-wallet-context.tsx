'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type MidnightNetwork = 'preview' | 'devnet' | 'preprod';

export type DetectedWalletType = '1am' | 'lace' | null;

export interface OneAMWalletState {
  isConnected: boolean;
  isConnecting: boolean;
  walletAddress: string | null;
  shieldedAddress: string | null;
  tNightBalance: number;
  tDustBalance: number;
  shieldedBalance: number;
  network: MidnightNetwork;
  is1AMInstalled: boolean;
  isLaceInstalled: boolean;
  detectedWallet: DetectedWalletType;
  error: string | null;
  connect: (networkOverride?: MidnightNetwork) => Promise<void>;
  disconnect: () => void;
  setNetwork: (net: MidnightNetwork) => void;
  transferDust: (amount: number) => Promise<void>;
  transferShielded: (amount: number) => Promise<void>;
  connectedApi: any | null;
}

// Backward-compatible type alias
export type LaceWalletState = OneAMWalletState;

const OneAMWalletContext = createContext<OneAMWalletState | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'midroll_1am_wallet_state_v2';
const FALLBACK_STORAGE_KEY = 'midroll_lace_wallet_state_v2';

// Helper: which brand is injected? Prefer 1AM, then Lace.
export const getDetectedWalletType = (): DetectedWalletType => {
  if (typeof window === 'undefined') return null;
  const win = window as any;
  if (!win.midnight) return null;

  // Explicit keys first — 1AM wins
  if (win.midnight['1am'] || win.midnight.oneam || win.midnight.oneAm) return '1am';

  const wallets = Object.values(win.midnight) as any[];
  const has1AM = wallets.some(
    (w) =>
      w?.name?.toLowerCase().includes('1am') ||
      w?.rdns?.toLowerCase().includes('1am') ||
      w?.name?.toLowerCase().includes('oneam')
  );
  if (has1AM) return '1am';

  if (win.midnight.mnLace || win.midnight.lace) return 'lace';
  const hasLace = wallets.some(
    (w) =>
      w?.name?.toLowerCase().includes('lace') ||
      w?.rdns?.toLowerCase().includes('lace')
  );
  if (hasLace) return 'lace';

  return null;
};

// Helper: prioritize finding the 1AM wallet in window.midnight
const find1AMWallet = (): any | null => {
  if (typeof window === 'undefined') return null;
  const win = window as any;
  if (!win.midnight) return null;

  // 1. Prefer the 1AM wallet explicitly
  if (win.midnight['1am']) return win.midnight['1am'];
  if (win.midnight.oneam) return win.midnight.oneam;
  if (win.midnight.oneAm) return win.midnight.oneAm;

  // 2. Fallback to mnLace or lace or any Midnight DApp connector
  if (win.midnight.mnLace) return win.midnight.mnLace;
  if (win.midnight.lace) return win.midnight.lace;

  // 3. CAIP-372 UUID keys — check 1AM first, then any injected wallet
  const wallets = Object.values(win.midnight) as any[];
  const oneAmMatch = wallets.find(
    (w) =>
      w?.name?.toLowerCase().includes('1am') ||
      w?.rdns?.toLowerCase().includes('1am') ||
      w?.name?.toLowerCase().includes('oneam')
  );
  if (oneAmMatch) return oneAmMatch;

  return wallets.find(
    (w) =>
      w?.name?.toLowerCase().includes('lace') ||
      w?.rdns?.toLowerCase().includes('lace') ||
      (typeof w?.connect === 'function' && typeof w?.enable === 'function')
  ) || wallets[0] || null;
};

export const OneAMWalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [shieldedAddress, setShieldedAddress] = useState<string | null>(null);
  const [tNightBalance, setTNightBalance] = useState<number>(0);
  const [tDustBalance, setTDustBalance] = useState<number>(0);
  const [shieldedBalance, setShieldedBalance] = useState<number>(0);
  const [network, setNetworkState] = useState<MidnightNetwork>('preview');
  const [is1AMInstalled, setIs1AMInstalled] = useState(false);
  const [isLaceInstalled, setIsLaceInstalled] = useState(false);
  const [detectedWallet, setDetectedWallet] = useState<DetectedWalletType>(null);
  const [error, setError] = useState<string | null>(null);
  const [connectedApi, setConnectedApi] = useState<any | null>(null);

  // Poll for wallet extension presence (1AM preferred, Lace fallback)
  useEffect(() => {
    const check = () => {
      const wallet = find1AMWallet();
      const type = getDetectedWalletType();
      setIs1AMInstalled(!!wallet);
      setDetectedWallet(type);
      // Lace counts as installed when a lace injector exists OR any wallet exists but type is lace/null
      // Keep it precise: true only when lace keys/names are found
      if (typeof window !== 'undefined') {
        const win = window as any;
        const hasLaceKey = !!(win.midnight?.mnLace || win.midnight?.lace);
        const wallets = win.midnight ? (Object.values(win.midnight) as any[]) : [];
        const hasLaceName = wallets.some(
          (w) =>
            w?.name?.toLowerCase().includes('lace') ||
            w?.rdns?.toLowerCase().includes('lace')
        );
        setIsLaceInstalled(hasLaceKey || hasLaceName || type === 'lace');
      }
    };
    check();
    const id = setInterval(check, 1000);
    return () => clearInterval(id);
  }, []);

  // Restore network preference and wasConnected state from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY) || localStorage.getItem(FALLBACK_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const savedNetwork = parsed.network || 'preview';
        setNetworkState(savedNetwork);
        if (parsed.wasConnected) {
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
    const activeNetwork = (typeof networkOverride === 'string') ? networkOverride : network;

    try {
      const oneAmWallet = find1AMWallet();

      if (!oneAmWallet) {
        throw new Error(
          '1AM wallet extension not found. Please install the Midnight 1AM extension and refresh.'
        );
      }

      // Connect — triggers unlock/authorize popup in 1AM wallet
      let api: any;
      if (typeof oneAmWallet.connect === 'function') {
        api = await oneAmWallet.connect(activeNetwork);
      } else if (typeof oneAmWallet.enable === 'function') {
        api = await oneAmWallet.enable();
      } else {
        throw new Error('1AM wallet does not expose a connect() or enable() method.');
      }

      if (!api) {
        throw new Error('1AM wallet returned no API. The connection was rejected or timed out.');
      }

      // Verify wallet is actually unlocked by fetching the unshielded address
      const addrRes = await api.getUnshieldedAddress();
      const unshieldedAddress = addrRes?.unshieldedAddress ?? addrRes ?? null;
      if (!unshieldedAddress) {
        throw new Error('Could not read wallet address. Please ensure your 1AM wallet is unlocked.');
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
      if (msg.toLowerCase().includes('locked')) {
        setError(`${detectedWallet === 'lace' ? 'Lace' : '1AM'} wallet is locked. Please click the ${detectedWallet === 'lace' ? 'Lace' : '1AM'} wallet extension icon and unlock it first.`);
      } else if (msg.toLowerCase().includes('rejected') || msg.toLowerCase().includes('user denied')) {
        setError('Connection rejected. Please approve the connection in the 1AM wallet popup.');
      } else {
        setError(msg);
      }
      console.error('1AM wallet connect error:', err);
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
    <OneAMWalletContext.Provider
      value={{
        isConnected,
        isConnecting,
        walletAddress,
        shieldedAddress,
        tNightBalance,
        tDustBalance,
        shieldedBalance,
        network,
        is1AMInstalled,
        isLaceInstalled,
        detectedWallet,
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
    </OneAMWalletContext.Provider>
  );
};

export const useOneAMWallet = () => {
  const context = useContext(OneAMWalletContext);
  if (!context) {
    throw new Error('useOneAMWallet must be used within a OneAMWalletProvider');
  }
  return context;
};

// Aliases for seamless backward compatibility across the codebase
export const LaceWalletProvider = OneAMWalletProvider;
export const useLaceWallet = useOneAMWallet;
