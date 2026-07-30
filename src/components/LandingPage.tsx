'use client';

import React, { useState, useEffect } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { 
  ArrowRight, 
  Wallet, 
  ShieldCheck, 
  Lock, 
  Cpu, 
  Receipt, 
  Vote, 
  UserCheck, 
  EyeOff, 
  Zap, 
  CheckCircle2,
  ChevronRight,
  FileCode2,
  Sparkles,
  Scale
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLaceWallet } from '@/lib/lace-wallet-context';
import { BoomerangVideoBg } from './BoomerangVideoBg';
import { LaceWalletModal } from './LaceWalletModal';

const VIDEO_URL = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260715_090628_7052d8a6-a094-4341-a4a2-ad58493a67a9.mp4';

const LogoMark = () => (
  <div className="w-[28px] h-[28px] rounded-[9px] bg-[#17211b] relative flex-shrink-0 shadow-sm">
    <div className="w-2.5 h-2.5 rounded-full bg-[#d7ff65] absolute top-[4px] right-[4px] border border-[#17211b]" />
  </div>
);

export function LandingPage() {
  const router = useRouter();
  const { isConnected } = useLaceWallet();
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'zk-payroll' | 'shielded-treasury' | 'compliance'>('zk-payroll');
  const [activeStep, setActiveStep] = useState<number>(1);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#f8faf7] overflow-x-hidden font-sans antialiased text-[#17211b]">
      <LaceWalletModal isOpen={isWalletModalOpen} onClose={() => setIsWalletModalOpen(false)} />

      {/* Simplified Fixed Navbar (Logo + Connect Wallet ONLY) */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 sm:px-10 md:px-14 py-4 sm:py-5 flex items-center justify-between bg-white/70 backdrop-blur-md border-b border-[#dfe5df]/50">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <LogoMark />
          <span className="font-extrabold text-[22px] tracking-[-0.8px] text-[#17211b]">Midroll</span>
          <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-[#eaf1ea] text-[#31834b] border border-[#cdd5cd]">
            Midnight ZK
          </span>
        </div>

        {/* CTA Right - Vibrant Accent Button */}
        {isConnected ? (
          <Link 
            href="/dashboard"
            className="flex items-center gap-2 px-5 py-2.5 bg-[#d7ff65] hover:bg-[#c5f04e] text-[#17211b] text-xs font-extrabold rounded-xl shadow-[0_4px_14px_rgba(215,255,101,0.4)] hover:shadow-[0_6px_20px_rgba(215,255,101,0.6)] hover:-translate-y-[1px] active:translate-y-0 transition-all duration-200"
          >
            <Wallet className="w-4 h-4 text-[#17211b]" />
            <span>Go to Dashboard</span>
          </Link>
        ) : (
          <button 
            onClick={() => setIsWalletModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#d7ff65] hover:bg-[#c5f04e] text-[#17211b] text-xs font-extrabold rounded-xl shadow-[0_4px_14px_rgba(215,255,101,0.4)] hover:shadow-[0_6px_20px_rgba(215,255,101,0.6)] hover:-translate-y-[1px] active:translate-y-0 transition-all duration-200"
          >
            <Wallet className="w-4 h-4 text-[#17211b]" />
            <span>Connect Wallet</span>
          </button>
        )}
      </nav>

      {/* Hero Section */}
      <main className="relative flex flex-col items-center overflow-hidden min-h-screen">
        <BoomerangVideoBg src={VIDEO_URL} />

        {/* Ambient Glow Orbs */}
        <div className="absolute top-1/4 left-10 w-72 h-72 bg-[#d7ff65]/20 rounded-full blur-[100px] pointer-events-none animate-pulse" />
        <div className="absolute bottom-1/3 right-10 w-80 h-80 bg-[#31834b]/15 rounded-full blur-[120px] pointer-events-none animate-pulse" />

        {/* Hero Content Z-10 */}
        <div className="z-10 flex flex-col items-center w-full flex-1">
          {/* Hero Copy Block */}
          <div className="pt-28 sm:pt-32 md:pt-36 px-4 sm:px-6 flex flex-col items-center text-center w-full max-w-4xl ">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/85 backdrop-blur-md border border-[#dfe5df] text-xs font-mono text-[#4c855a] mb-6 shadow-sm hover:scale-105 transition-transform duration-300">
              {/* <span className="w-2 h-2 rounded-full bg-[#31834b] animate-ping" /> */}
              <Sparkles className="w-3.5 h-3.5 text-[#31834b]" />
              <span>Zero-Knowledge Corporate Ledger & Payroll</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl lg:text-8xl leading-[1.05] tracking-tight text-[#17211b] font-normal max-w-3xl">
              Build lasting relationships.
            </h1>
            <p className="max-w-xl mt-6 text-base sm:text-lg text-[#718077] leading-relaxed">
              Confidential payroll, shielded expense reimbursement, and provable compliance — built on Midnight&apos;s zero-knowledge smart contract infrastructure.
            </p>
            
            <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
              {isConnected ? (
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2.5 px-8 py-3.5 bg-[#d7ff65] hover:bg-[#c5f04e] text-[#17211b] text-sm font-extrabold rounded-xl shadow-[0_6px_20px_rgba(215,255,101,0.45)] hover:shadow-[0_10px_30px_rgba(215,255,101,0.7)] hover:-translate-y-[3px] active:translate-y-0 transition-all duration-300"
                >
                  <Wallet className="w-4 h-4 text-[#17211b]" />
                  <span>Go to Dashboard</span>
                </Link>
              ) : (
                <button 
                  onClick={() => setIsWalletModalOpen(true)}
                  className="flex items-center gap-2.5 px-8 py-3.5 bg-[#d7ff65] hover:bg-[#c5f04e] text-[#17211b] text-sm font-extrabold rounded-xl shadow-[0_6px_20px_rgba(215,255,101,0.45)] hover:shadow-[0_10px_30px_rgba(215,255,101,0.7)] hover:-translate-y-[3px] active:translate-y-0 transition-all duration-300"
                >
                  <Wallet className="w-4 h-4 text-[#17211b]" />
                  <span>Connect Wallet to Launch</span>
                </button>
              )}
              
              <a 
                href="#how-it-works"
                className="flex items-center gap-2 px-6 py-3.5 bg-white/90 hover:bg-white text-[#17211b] text-sm font-bold rounded-xl border border-[#dfe5df] shadow-sm hover:border-[#17211b]/40 hover:-translate-y-[2px] transition-all duration-300"
              >
                <span>How It Works</span>
                <ChevronRight className="w-4 h-4 text-[#718077]" />
              </a>
            </div>
          </div>

          {/* Bottom Banner Panel */}
          <div className="mt-auto w-full max-w-5xl px-4 sm:px-6 pt-16">
            <div className="bg-white/95 backdrop-blur-md border border-[#dfe5df] border-b-0 pt-8 sm:pt-10 px-6 sm:px-10 pb-0 rounded-t-[24px] shadow-[0_16px_40px_rgba(27,50,34,0.08)]">
              <div className="grid md:grid-cols-2 gap-6 md:gap-12">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.08em] text-[#31834b] font-mono font-bold flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#31834b]" />
                    WHAT MIDROLL DOES
                  </div>
                  <h2 className="mt-2 text-2xl sm:text-3xl font-serif font-normal text-[#17211b]">
                    Payments that build momentum & preserve privacy
                  </h2>
                </div>
                <div className="flex items-end">
                  <p className="text-sm text-[#718077] leading-relaxed">
                    Midroll decouples private transaction execution from public audit verification. Employers execute batch payouts while employee balances and amounts remain completely private.
                  </p>
                </div>
              </div>

              {/* Divider */}
              <div className="mt-8 h-px bg-[#dfe5df] w-full" />

              {/* Interactive Preview Buttons */}
              <div className="grid sm:grid-cols-3 gap-3 py-5">
                {[
                  { id: 'zk-payroll', num: '01', label: 'Zero-Knowledge Payroll' },
                  { id: 'shielded-treasury', num: '02', label: 'Shielded Treasury' },
                  { id: 'compliance', num: '03', label: 'Selective Compliance' }
                ].map((item) => (
                  <button 
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id as any);
                      document.getElementById('deep-dive')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="group bg-[#f8faf7] hover:bg-[#eaf1ea] border border-[#dfe5df] hover:border-[#cdd5cd] rounded-xl transition-all duration-300 px-4 py-3.5 flex justify-between items-center text-left hover:-translate-y-0.5 hover:shadow-sm"
                  >
                    <div>
                      <span className="text-[#aebbb2] font-mono text-[10px]">{item.num}</span>
                      <span className="mx-2 text-[#dfe5df]">/</span>
                      <span className="font-bold text-xs text-[#17211b]">{item.label}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[#718077] group-hover:text-[#17211b] group-hover:translate-x-1 transition-all duration-300" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Section 2: How It Works on Midnight Blockchain */}
      <section id="how-it-works" className="py-24 px-6 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="text-xs font-mono uppercase tracking-widest text-[#31834b] font-bold mb-3">
            ARCHITECTURE & WORKFLOW
          </div>
          <h2 className="text-3xl sm:text-5xl font-serif text-[#17211b]">
            How Midroll Operates on Midnight
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[#718077] leading-relaxed">
            Midnight uses dual-state smart contracts compiled from Compact. Midroll leverages zero-knowledge proofs to run payroll dispatches on-chain without revealing private payment details.
          </p>
        </div>

        {/* Workflow Diagram Cards */}
        <div className="grid md:grid-cols-4 gap-6">
          {[
            {
              step: 1,
              title: 'Shielded Key Commitment',
              desc: 'Employees generate a private key commitment locally in Lace Wallet. No real identities or plaintext addresses are exposed.',
              icon: Lock,
            },
            {
              step: 2,
              title: 'Compact ZK Proof',
              desc: 'The employer dispatches payments. Compact circuits generate zk-SNARK proofs locally inside the browser extension.',
              icon: Cpu,
            },
            {
              step: 3,
              title: 'tDUST Gas Execution',
              desc: 'Transactions execute using tDUST ZK fuel while keeping tNIGHT token transfers private and shielded on-chain.',
              icon: Zap,
            },
            {
              step: 4,
              title: 'Verifiable Ledger',
              desc: 'The Midnight blockchain verifies the cryptographic proof, updating balances confidentially with full auditability.',
              icon: ShieldCheck,
            },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeStep === item.step;
            return (
              <div
                key={item.step}
                onClick={() => setActiveStep(item.step)}
                className={`p-6 rounded-2xl border transition-all duration-300 cursor-pointer relative ${
                  isActive
                    ? 'bg-white border-[#17211b] shadow-xl -translate-y-1.5'
                    : 'bg-[#f8faf7] border-[#dfe5df] hover:bg-white hover:border-[#cdd5cd] hover:-translate-y-1'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl transition-all duration-300 ${isActive ? 'bg-[#17211b] text-[#d7ff65] scale-110 shadow-md' : 'bg-[#eaf1ea] text-[#17211b]'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="font-mono text-xs font-extrabold text-[#718077]">
                    0{item.step}
                  </span>
                </div>
                <h3 className="font-bold text-base text-[#17211b] mb-2">{item.title}</h3>
                <p className="text-xs text-[#718077] leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Section 3: Payment Distribution Ledger Deep Dive */}
      <section id="deep-dive" className="py-20 bg-white border-y border-[#dfe5df]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-5 space-y-6">
              <div className="text-xs font-mono uppercase tracking-widest text-[#31834b] font-bold">
                PAYMENT DISTRIBUTION LEDGER
              </div>
              <h2 className="text-3xl sm:text-4xl font-serif text-[#17211b] leading-tight">
                Confidential Payroll & Expense Reimbursement
              </h2>
              <p className="text-sm text-[#718077] leading-relaxed">
                Traditional blockchain payments leak employee salaries and corporate treasury reserves. Midroll protects your business with native Midnight privacy.
              </p>

              {/* Tab Selector */}
              <div className="space-y-3 pt-2">
                {[
                  {
                    id: 'zk-payroll',
                    title: 'Batch Shielded Payroll',
                    subtitle: 'Dispatch 100+ employee salaries in a single private batch',
                  },
                  {
                    id: 'shielded-treasury',
                    title: 'Dual Balance Reserve',
                    subtitle: 'Manage unshielded tNIGHT alongside shielded ZK balances',
                  },
                  {
                    id: 'compliance',
                    title: 'Verifiable Compliance Proofs',
                    subtitle: 'Generate zero-knowledge tax & audit certificates',
                  },
                ].map((tab) => (
                  <div
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-[#17211b] text-white border-[#17211b] shadow-md'
                        : 'bg-[#f8faf7] text-[#17211b] border-[#dfe5df] hover:border-[#cdd5cd]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm">{tab.title}</span>
                      {activeTab === tab.id && (
                        <span className="w-2 h-2 rounded-full bg-[#d7ff65]" />
                      )}
                    </div>
                    <p className={`text-xs mt-1 ${activeTab === tab.id ? 'text-slate-300' : 'text-[#718077]'}`}>
                      {tab.subtitle}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Interactive Visual Card */}
            <div className="lg:col-span-7">
              <div className="bg-[#17211b] text-white p-6 sm:p-8 rounded-3xl border border-[#25332b] shadow-2xl space-y-6 relative overflow-hidden">
                <div className="absolute -right-12 -top-12 w-48 h-48 bg-[#d7ff65]/10 rounded-full blur-3xl pointer-events-none" />

                {activeTab === 'zk-payroll' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b border-white/10">
                      <div className="flex items-center gap-3">
                        <FileCode2 className="w-6 h-6 text-[#d7ff65]" />
                        <div>
                          <h4 className="font-bold text-base">compact_circuit: dispatch_payroll</h4>
                          <span className="text-[11px] font-mono text-slate-400">Circuit ID: 0x8f3a...b491</span>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-[#d7ff65]/20 text-[#d7ff65] border border-[#d7ff65]/30">
                        ZKP Active
                      </span>
                    </div>

                    <div className="space-y-3 font-mono text-xs">
                      <div className="p-3 bg-white/5 rounded-xl border border-white/10 flex justify-between items-center">
                        <span className="text-slate-400">Shielded Recipients</span>
                        <span className="text-[#d7ff65] font-bold">14 Employees</span>
                      </div>
                      <div className="p-3 bg-white/5 rounded-xl border border-white/10 flex justify-between items-center">
                        <span className="text-slate-400">Total Payroll Dispatched</span>
                        <span className="text-white font-bold">250,000 tNIGHT</span>
                      </div>
                      <div className="p-3 bg-white/5 rounded-xl border border-white/10 flex justify-between items-center">
                        <span className="text-slate-400">Public Visibility</span>
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <EyeOff className="w-3.5 h-3.5" /> 0% (Fully Shielded)
                        </span>
                      </div>
                    </div>

                    <div className="p-4 bg-[#25332b] rounded-xl border border-[#31834b]/40 text-xs text-slate-300 leading-relaxed">
                      💡 Employees receive funds instantly into their Lace Wallet key commitments without public block explorers indexing salary amounts.
                    </div>
                  </div>
                )}

                {activeTab === 'shielded-treasury' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b border-white/10">
                      <div className="flex items-center gap-3">
                        <Wallet className="w-6 h-6 text-[#d7ff65]" />
                        <div>
                          <h4 className="font-bold text-base">Corporate Dual-State Ledger</h4>
                          <span className="text-[11px] font-mono text-slate-400">Midnight Testnet Preview</span>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Synced
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 font-mono">
                      <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-1">
                        <span className="text-[10px] text-slate-400 uppercase">Shielded Balance</span>
                        <div className="text-xl font-bold text-[#d7ff65]">450,000 tNIGHT</div>
                        <span className="text-[10px] text-slate-400 block">Private ZK Ledger</span>
                      </div>
                      <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-1">
                        <span className="text-[10px] text-slate-400 uppercase">Unshielded Balance</span>
                        <div className="text-xl font-bold text-white">12,500 tNIGHT</div>
                        <span className="text-[10px] text-slate-400 block">Public Settlement</span>
                      </div>
                    </div>

                    <div className="p-4 bg-[#25332b] rounded-xl border border-[#31834b]/40 text-xs text-slate-300 leading-relaxed">
                      ⚡ Transaction fees are seamlessly covered by tDUST fuel reserve, ensuring gasless user experiences for your team.
                    </div>
                  </div>
                )}

                {activeTab === 'compliance' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b border-white/10">
                      <div className="flex items-center gap-3">
                        <Scale className="w-6 h-6 text-[#d7ff65]" />
                        <div>
                          <h4 className="font-bold text-base">Zero-Knowledge Compliance Engine</h4>
                          <span className="text-[11px] font-mono text-slate-400">Audit Proof Generator</span>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        Verified
                      </span>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                        <span className="text-slate-300">Tax Withholding Verification</span>
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Cryptographically Proven
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                        <span className="text-slate-300">Sanctioned Address Check</span>
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Passed Zero-Leaks
                        </span>
                      </div>
                    </div>

                    <div className="p-4 bg-[#25332b] rounded-xl border border-[#31834b]/40 text-xs text-slate-300 leading-relaxed">
                      🔒 Auditors can verify corporate tax compliance using viewing keys without exposing individual salary histories.
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Enterprise ZK Suite Features */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="text-xs font-mono uppercase tracking-widest text-[#31834b] font-bold mb-3">
            COMPLETE CAPABILITIES
          </div>
          <h2 className="text-3xl sm:text-5xl font-serif text-[#17211b]">
            Enterprise Suite Built for Midnight
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[#718077]">
            Everything your company needs to operate securely on a public blockchain without compromising privacy.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: 'Shielded Expenses',
              desc: 'Employees submit expense receipts with zero-knowledge proof status. Reimbursements dispatch privately into Lace Wallet.',
              icon: Receipt,
            },
            {
              title: 'Anonymous Governance',
              desc: 'Execute corporate votes and board polls where individual token balances weigh votes without revealing voter identity.',
              icon: Vote,
            },
            {
              title: 'Whistleblower Integrity',
              desc: 'Encrypted reporting channel for employees. Submit reports backed by cryptographic proof of employment.',
              icon: UserCheck,
            },
            {
              title: 'Lace Extension Native',
              desc: 'Seamless integration with Midnight Lace Wallet. Key commitments, tNIGHT, and tDUST handled out of the box.',
              icon: Wallet,
            },
            {
              title: 'Compact ZK Circuits',
              desc: 'Built on Midnight Compact smart contract circuits. Formal mathematical proof verification directly on-chain.',
              icon: FileCode2,
            },
            {
              title: 'Real-time Audit Logs',
              desc: 'Stream live protocol verification events. Track transaction status with CAIP-372 cryptographic handshake.',
              icon: ShieldCheck,
            },
          ].map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div
                key={i}
                className="bg-white p-8 rounded-2xl border border-[#dfe5df] hover:border-[#17211b]/30 shadow-sm hover:shadow-lg transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl bg-[#eaf1ea] text-[#17211b] group-hover:bg-[#17211b] group-hover:text-[#d7ff65] flex items-center justify-center mb-6 transition-colors duration-300">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#17211b] mb-2">{feature.title}</h3>
                <p className="text-xs sm:text-sm text-[#718077] leading-relaxed">{feature.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Section 5: Live Network Performance Stats */}
      <section className="py-16 bg-[#17211b] text-white border-y border-[#25332b]">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl sm:text-5xl font-extrabold font-mono text-[#d7ff65]">&lt; 3s</div>
            <div className="text-xs text-slate-400 font-mono uppercase tracking-wider mt-2">ZK Verification</div>
          </div>
          <div>
            <div className="text-3xl sm:text-5xl font-extrabold font-mono text-white">100%</div>
            <div className="text-xs text-slate-400 font-mono uppercase tracking-wider mt-2">Privacy Preserved</div>
          </div>
          <div>
            <div className="text-3xl sm:text-5xl font-extrabold font-mono text-[#d7ff65]">0.00</div>
            <div className="text-xs text-slate-400 font-mono uppercase tracking-wider mt-2">Gas Volatility (tDUST)</div>
          </div>
          <div>
            <div className="text-3xl sm:text-5xl font-extrabold font-mono text-white">256-bit</div>
            <div className="text-xs text-slate-400 font-mono uppercase tracking-wider mt-2">Key Commitment</div>
          </div>
        </div>
      </section>

      {/* Section 6: Bottom Call to Action */}
      <section className="py-24 px-6 max-w-4xl mx-auto text-center">
        <div className="bg-white p-10 sm:p-14 rounded-3xl border border-[#dfe5df] shadow-xl space-y-6">
          <div className="w-14 h-14 bg-[#eaf1ea] text-[#17211b] rounded-2xl flex items-center justify-center mx-auto">
            <Sparkles className="w-7 h-7 text-[#31834b]" />
          </div>

          <h2 className="text-3xl sm:text-4xl font-serif text-[#17211b]">
            Ready to Upgrade Your Corporate Payroll?
          </h2>

          <p className="text-sm sm:text-base text-[#718077] max-w-lg mx-auto leading-relaxed">
            Connect your Midnight Lace Wallet to launch the Midroll administrative portal and execute zero-knowledge payouts.
          </p>

          <button
            onClick={() => setIsWalletModalOpen(true)}
            className="inline-flex items-center gap-2.5 px-8 py-4 bg-[#d7ff65] hover:bg-[#c5f04e] text-[#17211b] text-sm font-extrabold rounded-xl shadow-[0_6px_20px_rgba(215,255,101,0.45)] hover:shadow-[0_8px_25px_rgba(215,255,101,0.65)] hover:-translate-y-[2px] transition-all duration-200"
          >
            <Wallet className="w-5 h-5 text-[#17211b]" />
            <span>Connect Lace Wallet</span>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#17211b] text-white py-12 px-6 border-t border-[#25332b]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <LogoMark />
            <span className="font-extrabold text-xl tracking-tight">Midroll</span>
            <span className="text-xs text-slate-400">© 2026 Midnight ZK Protocol</span>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-400 font-mono">
            <span>Powered by Midnight Blockchain</span>
            <span>·</span>
            <span>Compact ZK Smart Contracts</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
