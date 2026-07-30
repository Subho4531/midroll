'use client';

import React, { useState } from 'react';
import { useLaceWallet } from '@/lib/lace-wallet-context';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Building2, Shield, Sparkles, Check, RefreshCw } from 'lucide-react';

interface CompanyOnboardingModalProps {
  isOpen: boolean;
  onCompanyCreated: (companyData: any) => void;
}

export const CompanyOnboardingModal: React.FC<CompanyOnboardingModalProps> = ({
  isOpen,
  onCompanyCreated,
}) => {
  const { walletAddress, shieldedAddress } = useLaceWallet();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Company Name is required.');
      return;
    }
    if (!walletAddress) {
      setError('Wallet Address not detected. Please reconnect Lace Wallet.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress,
          shieldedAddress: shieldedAddress || null,
          name: name.trim(),
          description: description.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create company profile.');
      }

      onCompanyCreated(data.company);
    } catch (err: any) {
      setError(err.message || 'An error occurred while creating your profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const truncate = (addr: string | null) => {
    if (!addr) return 'Not Available';
    return `${addr.substring(0, 10)}...${addr.substring(addr.length - 6)}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-lg bg-white border border-[#dfe5df] text-[#17211b]">
        <DialogHeader>
          <div className="flex items-center space-x-3 mb-1">
            <div className="p-3 rounded-2xl bg-[#eaf1ea] border border-[#cdd5cd] text-[#17211b]">
              <Building2 className="w-7 h-7 text-[#31834b]" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-extrabold text-[#17211b] font-serif">
                Welcome to Midroll
              </DialogTitle>
              <DialogDescription className="text-xs text-[#718077] font-mono uppercase tracking-wider">
                Setup Corporate Account & ZK Workspace
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 my-2">
          {error && (
            <div className="p-3 bg-[#ffdbda] border border-[#f3aaa4] rounded-xl text-xs text-[#881337]">
              {error}
            </div>
          )}

          {/* Wallet Address Identity Preview */}
          <div className="p-3.5 bg-[#f8faf7] border border-[#dfe5df] rounded-xl space-y-2 text-xs">
            <div className="flex items-center justify-between font-mono text-[11px] text-[#718077] uppercase font-bold">
              <span>Connected Admin Key</span>
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Active
              </span>
            </div>
            <div className="font-mono text-xs text-[#17211b] bg-white p-2 rounded-lg border border-[#dfe5df] flex justify-between items-center">
              <span>Public Key: {truncate(walletAddress)}</span>
              <Shield className="w-3.5 h-3.5 text-[#31834b]" />
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#17211b] uppercase font-mono tracking-wider">
              Company / Organization Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Acme Corp ZK Labs"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-[#dfe5df] rounded-xl text-sm focus:outline-none focus:border-[#17211b]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#17211b] uppercase font-mono tracking-wider">
              Description / Industry Purpose
            </label>
            <textarea
              rows={3}
              placeholder="Describe your organization's zero-knowledge payroll or treasury purpose..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-[#dfe5df] rounded-xl text-sm focus:outline-none focus:border-[#17211b]"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-[#17211b] hover:bg-[#25332b] text-white font-bold rounded-xl flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-[#d7ff65]" />
                  <span>Registering Account in Database...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 text-[#d7ff65]" />
                  <span>Create ZK Company Workspace</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
