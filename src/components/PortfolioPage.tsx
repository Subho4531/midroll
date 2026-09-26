'use client';

import React, { useEffect, useState } from 'react';
import {
  Building2,
  Shield,
  ShieldCheck,
  Wallet,
  Copy,
  Check,
  RefreshCw,
  Save,
  Users,
  Layers,
  ReceiptText,
  CalendarDays,
  Fingerprint,
  Eye,
} from 'lucide-react';
import { useOneAMWallet } from '@/lib/lace-wallet-context';
import { useAppContext } from '@/lib/app-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import confetti from 'canvas-confetti';

const truncateAddr = (addr: string | null | undefined) => {
  if (!addr) return 'Not linked';
  if (addr.length <= 16) return addr;
  return `${addr.substring(0, 10)}...${addr.substring(addr.length - 6)}`;
};

const initialsOf = (name: string) => {
  if (!name.trim()) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

const formatDate = (iso: string | null | undefined) => {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
};

export const PortfolioPage: React.FC = () => {
  const { walletAddress, shieldedAddress } = useOneAMWallet();
  const { company, setCompany, handleAddLog } = useAppContext();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [shieldedAddrInput, setShieldedAddrInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Prefill from context immediately, then refresh from DB
  useEffect(() => {
    if (company) {
      setName(company.name ?? '');
      setDescription(company.description ?? '');
      setShieldedAddrInput(company.shieldedAddress ?? shieldedAddress ?? '');
    } else if (shieldedAddress) {
      setShieldedAddrInput(shieldedAddress);
    }
  }, [company, shieldedAddress]);

  useEffect(() => {
    const fetchCompany = async () => {
      if (!walletAddress) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/company?walletAddress=${encodeURIComponent(walletAddress)}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load brand profile.');
        if (data.exists && data.company) {
          setCompany(data.company);
          setName(data.company.name ?? '');
          setDescription(data.company.description ?? '');
          setShieldedAddrInput(data.company.shieldedAddress ?? shieldedAddress ?? '');
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred while loading your profile.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchCompany();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletAddress]);

  const isDirty =
    !!company &&
    (name.trim() !== (company.name ?? '') ||
      description.trim() !== (company.description ?? '') ||
      (shieldedAddrInput.trim() || '') !== (company.shieldedAddress ?? ''));

  const handleCopy = async (value: string | null | undefined, field: string) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 1500);
    } catch {
      // clipboard unavailable — no-op
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Brand name is required.');
      return;
    }
    if (!walletAddress) {
      setError('Wallet address not detected. Please reconnect your 1AM wallet.');
      return;
    }
    setIsSaving(true);
    setError(null);
    setSavedFlash(false);
    try {
      const res = await fetch('/api/company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress,
          shieldedAddress: shieldedAddrInput.trim() || null,
          name: name.trim(),
          description: description.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save brand profile.');
      setCompany(data.company);
      handleAddLog(`Updated brand profile “${data.company.name}”`, 'Portfolio edit saved to Postgres');
      confetti({ particleCount: 60, spread: 60 });
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 3500);
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (!company) return;
    setName(company.name ?? '');
    setDescription(company.description ?? '');
    setShieldedAddrInput(company.shieldedAddress ?? '');
    setError(null);
  };

  const contactCount = company?.contacts?.length ?? 0;
  const teamCount = company?.teams?.length ?? 0;
  const txnCount = company?.transactions?.length ?? 0;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hero banner */}
      <div className="card hero relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl grid place-items-center font-extrabold text-lg shrink-0 bg-[#d7ff65] text-[#17211b] border border-white/20">
              {initialsOf(name || company?.name || '')}
            </div>
            <div>
              <div className="eyebrow text-[#aebbb2] mb-1.5 font-mono">Brand Identity & Workspace Profile</div>
              <h1 className="display-head text-3xl md:text-4xl text-white">
                {company?.name || 'Brand Portfolio'}
              </h1>
              <p className="text-sm text-[#aebbb2] mt-2 max-w-xl">
                Edit the public profile details of the current brand. Changes sync to your Postgres
                workspace keyed by admin wallet.
              </p>
              {company && (
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <Badge variant="secondary" className="font-mono text-[10px] bg-white/10 text-white border-white/15">
                    <Fingerprint className="w-3 h-3 mr-1" />
                    {truncateAddr(company.walletAddress)}
                  </Badge>
                  <Badge variant="secondary" className="font-mono text-[10px] bg-white/10 text-white border-white/15">
                    <CalendarDays className="w-3 h-3 mr-1" />
                    Since {formatDate(company.createdAt)}
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {/*   */}
        </div>
        <img
          src="/images/unsheilded.png"
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none z-0 opacity-20"
        />
      </div>

      {error && (
        <div className="p-4 bg-rose/10 border border-rose/30 rounded-xl text-rose flex items-start gap-3">
          <Shield className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Something needs attention</p>
            <p className="text-xs text-muted mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {savedFlash && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-center gap-3">
          <Check className="w-5 h-5 shrink-0" />
          <p className="text-sm font-semibold">Brand profile saved successfully.</p>
        </div>
      )}

      {isLoading ? (
        <div className="card text-center py-12 text-muted">
          <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs uppercase font-mono tracking-widest font-semibold">Loading brand profile...</p>
        </div>
      ) : !walletAddress ? (
        <div className="card text-center py-12">
          <Wallet className="w-8 h-8 text-muted mx-auto mb-2" />
          <p className="font-semibold text-ink">Connect your wallet to manage this brand</p>
          <p className="text-xs text-muted mt-1">Your portfolio is keyed to the connected admin wallet address.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Edit form */}
          <div className="card lg:col-span-2 space-y-6">
            <div className="card-head pb-3 border-b border-line">
              <div>
                <h2 className="display-head text-lg flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-muted" />
                  Brand Details
                </h2>
                <p className="text-xs text-muted mt-1">Update the name, story and shielded identity of this workspace</p>
              </div>
              {isDirty && (
                <Badge variant="secondary" className="text-[10px] font-mono uppercase">Unsaved changes</Badge>
              )}
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-muted uppercase tracking-wider font-mono mb-1.5">
                  Brand / Organization Name *
                </label>
                <Input
                  type="text"
                  required
                  placeholder="e.g. Acme Corp ZK Labs"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full"
                  maxLength={80}
                />
                <p className="text-[10px] text-muted font-mono mt-1 text-right">{name.length}/80</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-muted uppercase tracking-wider font-mono mb-1.5">
                  Description / Industry Purpose
                </label>
                <textarea
                  rows={4}
                  placeholder="Describe your organization's zero-knowledge payroll or treasury purpose..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full"
                  maxLength={500}
                />
                <p className="text-[10px] text-muted font-mono mt-1 text-right">{description.length}/500</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-muted uppercase tracking-wider font-mono mb-1.5">
                  Shielded Address <span className="normal-case font-medium">(optional)</span>
                </label>
                <Input
                  type="text"
                  placeholder="e.g. shield1..."
                  value={shieldedAddrInput}
                  onChange={(e) => setShieldedAddrInput(e.target.value)}
                  className="w-full font-mono text-xs"
                />
                <p className="text-[10px] text-muted mt-1.5 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Used for private ZK payroll dispatch. Leave blank to fall back to the connected wallet.
                </p>
              </div>

              <div className="pt-3 border-t border-line flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={handleReset} disabled={!isDirty || isSaving}>
                  Discard
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving || !isDirty}
                  style={{ background: 'var(--ink)', color: 'white' }}
                  className="flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Profile
                    </>
                  )}
                </Button>
              </div>
            </form>

            {/* Identity — read-only keys */}
            <div className="pt-2 border-t border-line space-y-3">
              <h3 className="display-head text-base text-muted">
                Workspace Identity
                <span className="font-mono text-[10px] font-bold tracking-wider uppercase align-middle ml-2">(read-only)</span>
              </h3>

              <div className="p-3.5 bg-[#fbfcfa] border border-line rounded-2xl space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-muted">
                      Admin Wallet (Primary Key)
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(walletAddress, 'admin')}
                      className="text-muted hover:text-ink transition flex items-center gap-1 text-[10px] font-mono font-bold"
                      title="Copy full address"
                    >
                      {copiedField === 'admin' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {copiedField === 'admin' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <div className="font-mono text-xs text-ink bg-white p-2.5 rounded-xl border border-line break-all whitespace-normal leading-relaxed select-all">
                    {walletAddress}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-white border border-line rounded-xl p-2.5">
                    <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-muted block mb-1">
                      Workspace ID
                    </span>
                    <span className="font-mono text-ink break-all">{company?.id ?? '—'}</span>
                  </div>
                  <div className="bg-white border border-line rounded-xl p-2.5">
                    <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-muted block mb-1">
                      Last Updated
                    </span>
                    <span className="font-semibold text-ink">{formatDate(company?.updatedAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Preview + stats */}
          <div className="space-y-6">
            <div className="card space-y-4">
              <div className="card-head pb-2 border-b border-line">
                <h2 className="display-head text-lg flex items-center gap-2">
                  <Eye className="w-4 h-4 text-muted" />
                  Live Preview
                </h2>
                <Badge variant="emerald" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">
                  How others see you
                </Badge>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl grid place-items-center font-extrabold bg-[#eaf1ea] border border-line text-ink">
                  {initialsOf(name || company?.name || '')}
                </div>
                <div className="min-w-0">
                  <p className="display-head text-lg text-ink truncate">{name || company?.name || 'Unnamed brand'}</p>
                  <p className="text-[10px] font-mono text-muted truncate">{truncateAddr(walletAddress)}</p>
                </div>
              </div>

              <p className="text-xs text-muted leading-relaxed break-words">
                {description || company?.description || 'No description yet — add one so payees recognise this brand.'}
              </p>

              {(shieldedAddrInput || company?.shieldedAddress) && (
                <div className="p-2.5 bg-[#fbfcfa] border border-line rounded-xl">
                  <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-muted flex items-center gap-1 mb-1">
                    <ShieldCheck className="w-3 h-3" /> Shielded
                  </span>
                  <span className="font-mono text-[11px] text-ink break-all whitespace-normal leading-relaxed">
                    {shieldedAddrInput || company?.shieldedAddress}
                  </span>
                </div>
              )}
            </div>

            <div className="card space-y-4">
              <div className="card-head pb-2 border-b border-line">
                <h2 className="display-head text-lg">Workspace Stats</h2>
                <span className="period">Live counts</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-3 bg-[#fbfcfa] border border-line rounded-2xl">
                  <Users className="w-4 h-4 mx-auto text-muted mb-1" />
                  <p className="text-lg font-extrabold text-ink font-mono">{contactCount}</p>
                  <p className="text-[10px] font-mono uppercase text-muted font-bold">Contacts</p>
                </div>
                <div className="p-3 bg-[#fbfcfa] border border-line rounded-2xl">
                  <Layers className="w-4 h-4 mx-auto text-muted mb-1" />
                  <p className="text-lg font-extrabold text-ink font-mono">{teamCount}</p>
                  <p className="text-[10px] font-mono uppercase text-muted font-bold">Teams</p>
                </div>
                <div className="p-3 bg-[#fbfcfa] border border-line rounded-2xl">
                  <ReceiptText className="w-4 h-4 mx-auto text-muted mb-1" />
                  <p className="text-lg font-extrabold text-ink font-mono">{txnCount}</p>
                  <p className="text-[10px] font-mono uppercase text-muted font-bold">Txns</p>
                </div>
              </div>
              <div className="p-3 bg-[#eef4ee] border border-line rounded-2xl text-[11px] text-muted leading-relaxed">
                Profile edits never change your wallet keys — they only update the display name,
                description and shielded address stored against this workspace.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
