'use client';

import React, { useState } from 'react';
import { Header, ActiveTab } from '@/components/Header';
import { ShieldedExpenses } from '@/components/ShieldedExpenses';
import { AnonymousGovernance } from '@/components/AnonymousGovernance';
import { EmployerPortal } from '@/components/EmployerPortal';
import { CompactContractViewer } from '@/components/CompactContractViewer';
import { WalletConnect } from '@/components/WalletConnect';
import { useLaceWallet } from '@/lib/lace-wallet-context';
import { ContactsPage } from '@/components/ContactsPage';
import { PaymentDispatcher } from '@/components/PaymentDispatcher';
import { LandingPage } from '@/components/LandingPage';
import { CompanyOnboardingModal } from '@/components/CompanyOnboardingModal';
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
import { Shield, Sparkles, AlertCircle, Info, Clock, CheckCircle2, History, RefreshCw, Wallet, Menu, Building2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const { isConnected, walletAddress, network, connect, isConnecting, tNightBalance, tDustBalance, shieldedBalance } = useLaceWallet();
  
  // App & Company Database state
  const [company, setCompany] = useState<any>(null);
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [isLoadingCompany, setIsLoadingCompany] = useState(false);

  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [receipts, setReceipts] = useState<ExpenseReceipt[]>(INITIAL_RECEIPTS);
  const [polls, setPolls] = useState<GovernancePoll[]>(INITIAL_POLLS);
  const [whistleblowerReports, setWhistleblowerReports] = useState<WhistleblowerReport[]>(INITIAL_WHISTLEBLOWER_REPORTS);
  
  const [treasuryBalance, setTreasuryBalance] = useState<number>(450000);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [protocolLogs, setProtocolLogs] = useState([
    { id: '1', status: 'success', title: 'Wallet context initialized', subtitle: 'CAIP-372 Handshake Active', time: 'Just now' },
    { id: '2', status: 'info', title: 'ZKP circuits compiled', subtitle: 'Compact schema verified', time: '12m' },
    { id: '3', status: 'info', title: 'Mock treasury funded', subtitle: '$450,000 USD secured', time: '1h' },
  ]);

  const logCounter = React.useRef(100);

  // Check company database record on wallet connection
  React.useEffect(() => {
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

  if (!isConnected) {
    return <LandingPage />;
  }

  return (
    <div className={`shell ${isSidebarCollapsed ? 'sidebar-collapsed' : ''} min-h-screen bg-[#f8faf7] text-[#17211b] selection:bg-purple-500 selection:text-white`}>
      
      {/* Left Sidebar Navigation */}
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />

      {/* Right Main Panel */}
      <main className="main">
        {/* Top Control Bar */}
        <header className="top">
          <div className="flex items-center gap-3">
            {isSidebarCollapsed && (
              <button 
                onClick={() => setIsSidebarCollapsed(false)}
                className="icon-btn flex items-center justify-center transition hover:bg-slate-100"
                title="Expand Sidebar"
              >
                <Menu className="w-4 h-4 text-ink" />
              </button>
            )}
            {/* Topbar Breadcrumb */}
            {/* <div className="crumb text-[10px] tracking-wider uppercase font-mono text-slate-500 font-bold flex items-center gap-2">
              <span className="text-[#31834b]">MIDROLL PROTOCOL</span>
              <span>/</span>
              <span className="text-[#17211b]">{activeTab.toUpperCase()}</span>
            </div> */}
          </div>
          <div className="top-actions">
            {/* Primary Connect Wallet Button in Header */}
            <button className="new flex items-center gap-2" onClick={() => window.dispatchEvent(new CustomEvent('open-wallet-modal'))}>
              <Wallet className="w-4 h-4" />
              {walletAddress ? `${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}` : 'Connect Wallet'}
            </button>
            <button className="icon-btn flex items-center justify-center font-bold text-slate-500 hover:text-slate-900 border border-slate-200 bg-white rounded-lg shadow-sm hover:shadow transition" aria-label="Search">⌕</button>
            <button className="icon-btn flex items-center justify-center font-bold text-slate-500 hover:text-slate-900 border border-slate-200 bg-white rounded-lg shadow-sm hover:shadow transition" aria-label="Notifications">◌</button>
          </div>
        </header>

        {/* Dynamic Welcome Heading with Date & Company Profile */}
        {activeTab === 'dashboard' && (
        <section className="intro border-b border-slate-200/80 pb-5 mb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              {/* <div className="eyebrow text-[10px] tracking-widest font-mono text-[#31834b] uppercase flex items-center gap-1.5 font-bold bg-[#eaf1ea] px-2.5 py-1 rounded-md border border-[#cdd5cd]">
                <Building2 className="w-3.5 h-3.5 text-[#31834b]" />
                {company ? company.name : 'ZK WORKSPACE'}
              </div> */}
              <span className="text-xs font-mono text-slate-400 font-medium">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#17211b] pt-1">
              {getGreeting()}, {company ? company.name : 'Admin'}.
            </h1>
          </div>
          {/* <p className="text-slate-500 max-w-[420px] text-xs leading-relaxed font-medium pt-1">
             Manage your zero-knowledge corporate operations and verify cryptographic proofs on Midnight.
          </p> */}
        </section>
        )}

        {/* Dashboard Overview Hub */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Metrics Cards */}
            <section className="metrics grid grid-cols-1 md:grid-cols-4 gap-4">
              <article className="card hero bg-[#17211b] text-white p-5 rounded-2xl relative overflow-hidden min-h-[150px] shadow-lg border border-[#17211b]">
                
                <div className="label text-[10px] tracking-widest font-mono text-slate-400 uppercase ">
                  Shielded Token Balance
                </div>
                <div className="metric text-2xl font-extrabold tracking-tight text-white mt-3 font-mono">
                  {formatBalance(shieldedBalance)} tNIGHT
                </div>
                <div className="trend text-[10px] text-[#d7ff65] font-bold mt-2">
                  ↑ Private ZK Ledger
                </div>
                <img 
                  src="/images/sheilded.png" 
                  alt="Shielded Token Balance Background" 
                  className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none transition-transform duration-500 group-hover:scale-105 z-0 opacity-20"
                />
              </article>

              <article className="card bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
                <div className="label text-[10px] tracking-widest font-mono text-slate-400 uppercase">
                  Unshielded Token Balance
                </div>
                <div className="metric text-2xl font-extrabold tracking-tight text-[#17211b] mt-3 font-mono">
                  {formatBalance(tNightBalance)} tNIGHT
                </div>
                <div className="trend text-[10px] text-[#31834b] font-bold mt-2">
                  ↑ Public Cardano/Midnight Ledger
                </div>
              </article>

              <article className="card bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
                <div className="label text-[10px] tracking-widest font-mono text-slate-400 uppercase">
                  TDust Balance
                </div>
                <div className="metric text-2xl font-extrabold tracking-tight text-[#17211b] mt-3 font-mono">
                  {formatBalance(tDustBalance)} DUST
                </div>
                <div className="trend text-[10px] text-[#31834b] font-bold mt-2">
                  ↑ Transaction Fee Reserve
                </div>
              </article>

              <article className="card bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
                <div className="label text-[10px] tracking-widest font-mono text-slate-400 uppercase">
                  Total Transactions
                </div>
                <div className="metric text-3xl font-extrabold tracking-tight text-[#17211b] mt-3">
                  {totalTxns}
                </div>
                <div className="trend text-[10px] text-[#31834b] font-bold mt-2">
                  ↑ Live Audit Velocity
                </div>
              </article>
            </section>

            {/* Level 2 Challenge Controls & Activity Console */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
              <div className="lg:col-span-2 space-y-6">
                {/* Shielded Dispatcher Panel */}
                <div className="items-start">
                  <PaymentDispatcher
                    onRedirectToContacts={() => setActiveTab('contacts')}
                    onAddLog={(title) => handleAddLog(title, 'Shielded payment dispatch')}
                  />
                </div>
              </div>

              {/* Live activity feed */}
              <article className="card bg-white border border-slate-200 p-5 rounded-2xl shadow-sm h-full flex flex-col">
                <div className="card-head flex items-center justify-between mb-4">
                  <h2 className="text-sm font-extrabold tracking-tight text-[#17211b] flex items-center gap-1.5">
                    <History className="w-4 h-4 text-slate-500" />
                    Live Protocol Log
                  </h2>
                  <Badge variant="secondary" className="text-[9px] uppercase font-mono">Real-Time</Badge>
                </div>
                <div className="activity divide-y divide-slate-100 flex-1 overflow-y-auto max-h-[380px] pr-1 space-y-2">
                  {protocolLogs.map((log) => (
                    <div key={log.id} className="activity-row flex items-center gap-3 py-2.5">
                      <i className={`status w-2 h-2 rounded-full ${log.status === 'success' ? 'bg-emerald-500' : 'bg-purple-400'} shrink-0`}></i>
                      <div className="flex-1">
                        <b className="text-xs text-[#17211b] block">{log.title}</b>
                        <span className="text-[10px] text-slate-400">{log.subtitle}</span>
                      </div>
                      <time className="text-[10px] font-mono text-slate-400">{log.time}</time>
                    </div>
                  ))}
                </div>
              </article>
            </section>
          </div>
        )}

        {/* Tab Panel Workflows */}
        <div className="pt-2">
          {activeTab === 'transactions' && (
            <ShieldedExpenses
              receipts={receipts}
              onAddReceipt={handleAddReceipt}
              onReimburse={handleReimburse}
            />
          )}

          {activeTab === 'contacts' && (
            <ContactsPage />
          )}

          {activeTab === 'settings' && (
            <EmployerPortal
              employees={employees}
              onAddEmployee={handleAddEmployee}
              treasuryBalanceUSD={treasuryBalance}
              onDepositTreasury={handleDepositTreasury}
            />
          )}
        </div>
      </main>

      {/* First-Time Company Registration Modal */}
      <CompanyOnboardingModal
        isOpen={isCompanyModalOpen}
        onCompanyCreated={handleCompanyCreated}
      />
    </div>
  );
}
