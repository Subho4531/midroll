'use client';

import React from 'react';
import { AppShell } from '@/components/AppShell';
import { useAppContext } from '@/lib/app-context';
import { useLaceWallet } from '@/lib/lace-wallet-context';
import { PaymentDispatcher } from '@/components/PaymentDispatcher';
import { History } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const {
    company,
    totalTxns,
    handleAddLog,
    protocolLogs,
    formatBalance,
    getGreeting,
  } = useAppContext();
  const wallet = useLaceWallet();

  return (
    <AppShell>
      {/* Dynamic Welcome Heading with Date & Company Profile */}
      <section className="intro border-b border-slate-200/80 pb-5 mb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-slate-400 font-medium">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#17211b] pt-1">
            {getGreeting()}, {company ? company.name : 'Admin'}.
          </h1>
        </div>
      </section>

      {/* Dashboard Overview Hub */}
      <div className="space-y-6">
        {/* Metrics Cards */}
        <section className="metrics grid grid-cols-1 md:grid-cols-4 gap-4">
          <article className="card hero bg-[#17211b] text-white p-5 rounded-2xl relative overflow-hidden min-h-[150px] shadow-lg border border-[#17211b]">
            <div className="label text-[10px] tracking-widest font-mono text-slate-400 uppercase">
              Shielded Token Balance
            </div>
            <div className="metric text-2xl font-extrabold tracking-tight text-white mt-3 font-mono">
              {formatBalance(wallet.shieldedBalance)} tNIGHT
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
              {formatBalance(wallet.tNightBalance)} tNIGHT
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
              {formatBalance(wallet.tDustBalance)} DUST
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
            <div className="items-start">
              <PaymentDispatcher
                onRedirectToContacts={() => router.push('/contacts')}
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
    </AppShell>
  );
}
