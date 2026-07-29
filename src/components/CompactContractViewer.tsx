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
      <Card className="border-blue-500/30 bg-slate-950/90 shadow-2xl relative overflow-hidden">
        <CardHeader className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
            <div>
              <div className="flex items-center space-x-2 text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2">
                <Terminal className="w-4 h-4" />
                <span>Native Midnight Compact Smart Contract</span>
              </div>
              <CardTitle className="text-3xl font-extrabold text-white">
                Compact DSL <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Circuit Source</span>
              </CardTitle>
              <CardDescription className="text-sm text-slate-300 mt-1">
                Inspecting <code className="text-cyan-300 bg-slate-900 px-2 py-0.5 rounded font-mono">contracts/midroll.compact</code> - zero-knowledge state definition compiled for Midnight blockchain.
              </CardDescription>
            </div>

            <Button
              variant="outline"
              size="lg"
              onClick={handleCopy}
              className="gap-2 shrink-0 border-blue-500/30 text-blue-300 hover:bg-slate-900"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied!' : 'Copy Compact Code'}</span>
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Code Display Container */}
      <Card className="border-indigo-900/40 overflow-hidden shadow-2xl p-0">
        <div className="bg-slate-950 px-6 py-3 border-b border-indigo-900/40 flex items-center justify-between text-xs font-mono text-slate-400">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
            <span className="ml-2 text-slate-200">contracts/midroll.compact</span>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="cyan">Target: Midnight Ledger</Badge>
            <Badge variant="outline">Compiler: compact DSL v0.23</Badge>
          </div>
        </div>

        <pre className="p-6 text-xs sm:text-sm font-mono text-slate-200 overflow-x-auto bg-slate-950/90 leading-relaxed selection:bg-cyan-500 selection:text-black">
          <code>{compactCode}</code>
        </pre>
      </Card>
    </div>
  );
};
