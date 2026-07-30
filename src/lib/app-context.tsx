'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useLaceWallet } from '@/lib/lace-wallet-context';
import {
  Employee,
  ExpenseReceipt,
  GovernancePoll,
  WhistleblowerReport,
  INITIAL_EMPLOYEES,
  INITIAL_RECEIPTS,
  INITIAL_POLLS,
  INITIAL_WHISTLEBLOWER_REPORTS,
} from '@/lib/midroll-zk';

export interface ProtocolLog {
  id: string;
  status: string;
  title: string;
  subtitle: string;
  time: string;
}

interface AppContextType {
  company: any;
  setCompany: React.Dispatch<React.SetStateAction<any>>;
  isCompanyModalOpen: boolean;
  setIsCompanyModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isLoadingCompany: boolean;
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  receipts: ExpenseReceipt[];
  setReceipts: React.Dispatch<React.SetStateAction<ExpenseReceipt[]>>;
  polls: GovernancePoll[];
  setPolls: React.Dispatch<React.SetStateAction<GovernancePoll[]>>;
  whistleblowerReports: WhistleblowerReport[];
  setWhistleblowerReports: React.Dispatch<React.SetStateAction<WhistleblowerReport[]>>;
  treasuryBalance: number;
  setTreasuryBalance: React.Dispatch<React.SetStateAction<number>>;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  protocolLogs: ProtocolLog[];
  setProtocolLogs: React.Dispatch<React.SetStateAction<ProtocolLog[]>>;
  totalTxns: number;
  handleAddLog: (title: string, subtitle?: string) => void;
  handleAddEmployee: (newEmp: Employee) => void;
  handleDepositTreasury: (amountUSD: number) => void;
  handleAddReceipt: (newRec: ExpenseReceipt) => void;
  handleReimburse: (receiptId: string) => void;
  handleCastVote: (pollId: string, optionIndex: number) => void;
  handleSubmitWhistleblowerReport: (report: WhistleblowerReport) => void;
  handleCompanyCreated: (newCompany: any) => void;
  formatBalance: (val: number) => string;
  formatUSD: (val: number) => string;
  getGreeting: () => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isConnected, walletAddress } = useLaceWallet();

  const [company, setCompany] = useState<any>(null);
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [isLoadingCompany, setIsLoadingCompany] = useState(false);

  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [receipts, setReceipts] = useState<ExpenseReceipt[]>(INITIAL_RECEIPTS);
  const [polls, setPolls] = useState<GovernancePoll[]>(INITIAL_POLLS);
  const [whistleblowerReports, setWhistleblowerReports] = useState<WhistleblowerReport[]>(INITIAL_WHISTLEBLOWER_REPORTS);

  const [treasuryBalance, setTreasuryBalance] = useState<number>(450000);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [protocolLogs, setProtocolLogs] = useState<ProtocolLog[]>([
    { id: '1', status: 'success', title: 'Wallet context initialized', subtitle: 'CAIP-372 Handshake Active', time: 'Just now' },
    { id: '2', status: 'info', title: 'ZKP circuits compiled', subtitle: 'Compact schema verified', time: '12m' },
    { id: '3', status: 'info', title: 'Mock treasury funded', subtitle: '$450,000 USD secured', time: '1h' },
  ]);

  const logCounter = useRef(100);

  useEffect(() => {
    if (isConnected && walletAddress) {
      setIsLoadingCompany(true);
      fetch(`/api/company?walletAddress=${encodeURIComponent(walletAddress)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.exists && data.company) {
            setCompany(data.company);
            setIsCompanyModalOpen(false);
          } else {
            setCompany(null);
            setIsCompanyModalOpen(true);
          }
        })
        .catch((err) => {
          console.error('Error fetching company:', err);
        })
        .finally(() => {
          setIsLoadingCompany(false);
        });
    } else {
      setCompany(null);
      setIsCompanyModalOpen(false);
    }
  }, [isConnected, walletAddress]);

  const handleCompanyCreated = (newCompany: any) => {
    setCompany(newCompany);
    setIsCompanyModalOpen(false);
    handleAddLog(`Registered ${newCompany.name}`, 'Company Profile Created in Database');
  };

  const handleAddLog = (title: string, subtitle = 'Verification lock active') => {
    logCounter.current += 1;
    setProtocolLogs((prev) => [
      { id: String(logCounter.current), status: 'success', title, subtitle, time: 'Just now' },
      ...prev,
    ]);
  };

  const totalTxns = receipts.length + protocolLogs.filter(log => log.title.toLowerCase().includes('tx') || log.title.toLowerCase().includes('success') || log.title.toLowerCase().includes('dispatched') || log.title.toLowerCase().includes('confirmed')).length + 5;

  const handleAddEmployee = (newEmp: Employee) => {
    setEmployees((prev) => [...prev, newEmp]);
  };

  const handleDepositTreasury = (amountUSD: number) => {
    setTreasuryBalance((prev) => prev + amountUSD);
  };

  const handleAddReceipt = (newRec: ExpenseReceipt) => {
    setReceipts((prev) => [newRec, ...prev]);
  };

  const handleReimburse = (receiptId: string) => {
    setReceipts((prev) =>
      prev.map((r) => (r.id === receiptId ? { ...r, zkProofStatus: 'REIMBURSED' } : r))
    );
  };

  const handleCastVote = (pollId: string, optionIndex: number) => {
    setPolls((prev) =>
      prev.map((p) => {
        if (p.id === pollId) {
          const updatedOptions = p.options.map((opt, idx) =>
            idx === optionIndex ? { ...opt, votesCount: opt.votesCount + 1 } : opt
          );
          return {
            ...p,
            options: updatedOptions,
            totalVotes: p.totalVotes + 1,
            userVotedOption: optionIndex,
          };
        }
        return p;
      })
    );
  };

  const handleSubmitWhistleblowerReport = (report: WhistleblowerReport) => {
    setWhistleblowerReports((prev) => [report, ...prev]);
  };

  const formatBalance = (val: number) => {
    let cleanVal = val;
    if (val > 10000000) {
      cleanVal = val / 1_000_000;
    }
    return cleanVal.toLocaleString(undefined, { maximumFractionDigits: 2 });
  };

  const formatUSD = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good morning';
    if (hr < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <AppContext.Provider
      value={{
        company,
        setCompany,
        isCompanyModalOpen,
        setIsCompanyModalOpen,
        isLoadingCompany,
        employees,
        setEmployees,
        receipts,
        setReceipts,
        polls,
        setPolls,
        whistleblowerReports,
        setWhistleblowerReports,
        treasuryBalance,
        setTreasuryBalance,
        isSidebarCollapsed,
        setIsSidebarCollapsed,
        protocolLogs,
        setProtocolLogs,
        totalTxns,
        handleAddLog,
        handleAddEmployee,
        handleDepositTreasury,
        handleAddReceipt,
        handleReimburse,
        handleCastVote,
        handleSubmitWhistleblowerReport,
        handleCompanyCreated,
        formatBalance,
        formatUSD,
        getGreeting,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
