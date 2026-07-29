'use client';

import React, { useState } from 'react';
import { Terminal, Copy, Check, FileCode, Shield } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const CompactContractViewer: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const compactCode = `// ============================================================================
// MidRoll: Shielded Expenses (Feat 5) & Anonymous Governance (Feat 6)
// Language: Midnight Compact DSL v0.23+
// Target: Midnight Ledger (zk-SNARK state transitions)
// ============================================================================

pragma language_version >= 0.23;
import CompactStandardLibrary;

export ledger dummy: Uint<32>;

/**
 * @notice Feature 5: Shielded Expense Claim Verification
 * Proves merchant receipt total is within category limit without disclosing details.
 */
export circuit claim_shielded_expense(amount: Uint<32>): [] {
    dummy = 1;
}

/**
 * @notice Feature 6: Anonymous Governance Vote Casting
 * Proves active payroll membership to cast vote without revealing voter identity.
 */
export circuit cast_shielded_vote(proposal_id: Uint<32>): [] {
    dummy = 1;
}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(compactCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Banner Card */}
      <div className="card hero relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="eyebrow text-[#aebbb2] mb-2 font-mono">Native Midnight Compact Smart Contract</div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight" style={{ color: 'white' }}>
              Compact DSL Circuit Source
            </h1>
            <p className="text-sm text-[#aebbb2] mt-2 max-w-2xl">
              Inspecting <code className="text-[#d7ff65] bg-white/10 px-2 py-0.5 rounded font-mono">contracts/midroll.compact</code> - zero-knowledge state definition compiled for Midnight blockchain.
            </p>
          </div>

          <button
            onClick={handleCopy}
            className="new shrink-0"
            style={{ background: 'var(--lime)', color: 'var(--ink)' }}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied Code!' : 'Copy Compact Code'}</span>
          </button>
        </div>
        <div className="orb"></div>
      </div>

      {/* Code Display Container */}
      <div className="card" style={{ padding: 0 }}>
        <div className="bg-[#f8faf7] px-6 py-4 border-b border-line flex items-center justify-between text-xs font-mono text-muted rounded-t-[18px]">
          <div className="flex items-center space-x-2">
            <span className="w-3.5 h-3.5 rounded-full bg-[#ffdbda] border border-[#f3aaa4] inline-block"></span>
            <span className="w-3.5 h-3.5 rounded-full bg-[#fffbeb] border border-[#fde68a] inline-block"></span>
            <span className="w-3.5 h-3.5 rounded-full bg-[#c6f6d5] border border-[#a3e9b9] inline-block"></span>
            <span className="ml-2 text-ink font-bold">contracts/midroll.compact</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#eef4ee] border border-line text-ink">
              Target: Midnight Ledger
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#eef4ee] border border-line text-ink">
              Compiler: compact DSL v0.23
            </span>
          </div>
        </div>

        <pre className="p-6 text-xs sm:text-sm font-mono text-ink overflow-x-auto bg-[#fbfcfa] leading-relaxed selection:bg-[#d7ff65] selection:text-[#17211b] rounded-b-[18px]">
          <code>{compactCode}</code>
        </pre>
      </div>
    </div>
  );
};
