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
  network: MidnightNetwork;
  isSimulatedMode: boolean;
  isLaceInstalled: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  setNetwork: (net: MidnightNetwork) => void;
  toggleSimulatedMode: (enabled?: boolean) => void;
}

const LaceWalletContext = createContext<LaceWalletState | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'midroll_lace_wallet_state';

// Types for window.midnight / window.cardano Lace API
declare global {
  interface Window {
    midnight?: {
      mnLace?: {
        name: string;
        apiVersion: string;
        enable: () => Promise<any>;
        isEnabled: () => Promise<boolean>;
      };
      lace?: any;
    };
    cardano?: {
      lace?: any;
    };
  }
}

export const LaceWalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [shieldedAddress, setShieldedAddress] = useState<string | null>(null);
  const [tNightBalance, setTNightBalance] = useState<number>(250000);
  const [tDustBalance, setTDustBalance] = useState<number>(42500);
  const [network, setNetworkState] = useState<MidnightNetwork>('preview');
  const [isSimulatedMode, setIsSimulatedMode] = useState(true);
  const [isLaceInstalled, setIsLaceInstalled] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if Lace for Midnight is present in window
  useEffect(() => {
    const checkLacePresence = () => {
      const hasLace = Boolean(
        window?.midnight?.mnLace || window?.midnight?.lace || window?.cardano?.lace
      );
      setIsLaceInstalled(hasLace);
    };

    checkLacePresence();
    const interval = setInterval(checkLacePresence, 1500);
    return () => clearInterval(interval);
  }, []);

  // Load initial state from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.isConnected) {
          setIsConnected(true);
          setWalletAddress(parsed.walletAddress || 'mn_addr_preview1q9z3u...8k9u7s');
          setShieldedAddress(parsed.shieldedAddress || '0xmid_shield_8829a1f');
          setTNightBalance(parsed.tNightBalance || 250000);
          setTDustBalance(parsed.tDustBalance || 42500);
          setNetworkState(parsed.network || 'preview');
          setIsSimulatedMode(parsed.isSimulatedMode ?? true);
        }
      }
    } catch (e) {
      console.error('Failed to load wallet state:', e);
    }
  }, []);

  // Save to localStorage when state updates
  useEffect(() => {
    if (isConnected) {
      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify({
          isConnected,
          walletAddress,
          shieldedAddress,
          tNightBalance,
          tDustBalance,
          network,
          isSimulatedMode,
        })
      );
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }, [isConnected, walletAddress, shieldedAddress, tNightBalance, tDustBalance, network, isSimulatedMode]);

  const connect = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      const laceApi = window?.midnight?.mnLace || window?.midnight?.lace || window?.cardano?.lace;

      if (laceApi && !isSimulatedMode) {
        // Attempt real Lace extension handshake
        const walletInstance = await laceApi.enable();
        const state = walletInstance.state ? await walletInstance.state() : null;
        
        const addr = state?.address || state?.shieldedAddress || 'mn_addr_preview1h3ssm5ru2t6eqy4g3she78zlxn96e36ms6pq996aduvmateh9p9sk96u7s';
        const shieldAddr = state?.shieldedAddress || '0xmid_shield_preview_991823a';
        
        setWalletAddress(addr);
        setShieldedAddress(shieldAddr);
        setIsConnected(true);
      } else {
        // Simulated Lace Wallet Connection Mode (Fallback & Local Devnet)
        await new Promise((r) => setTimeout(r, 800));
        
        const mockAddress = network === 'preview' 
          ? 'mn_addr_preview1h3ssm5ru2t6eqy4g3she78zlxn96e36ms6pq996aduvmateh9p9sk96u7s'
          : network === 'devnet'
          ? 'mn_addr_undeployed1h3ssm5ru2t6eqy4g3she78zlxn96e36ms6pq996aduvmateh9p9sk96u7s'
          : 'mn_addr_preprod1h3ssm5ru2t6eqy4g3she78zlxn96e36ms6pq996aduvmateh9p9sk96u7s';

        setWalletAddress(mockAddress);
        setShieldedAddress('0xmid_shield_85dd06179800830b2d181f3238ecf3b94a0ae820bcc62953e50c0f9d26743a7d');
        setIsConnected(true);
      }
    } catch (err: any) {
      console.error('Lace wallet connection error:', err);
      setError(err?.message || 'User rejected Lace wallet connection attempt.');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setIsConnected(false);
    setWalletAddress(null);
    setShieldedAddress(null);
    setError(null);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  const setNetwork = (net: MidnightNetwork) => {
    setNetworkState(net);
    if (isConnected && walletAddress) {
      // Update prefix for display if simulated
      if (walletAddress.startsWith('mn_addr_')) {
        const parts = walletAddress.split('1');
        if (parts.length > 1) {
          setWalletAddress(`mn_addr_${net}1${parts[1]}`);
        }
      }
    }
  };

  const toggleSimulatedMode = (enabled?: boolean) => {
    setIsSimulatedMode((prev) => (enabled !== undefined ? enabled : !prev));
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
        network,
        isSimulatedMode,
        isLaceInstalled,
        error,
        connect,
        disconnect,
        setNetwork,
        toggleSimulatedMode,
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
