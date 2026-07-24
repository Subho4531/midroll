'use client';

import React, { useState } from 'react';
import { FileCode, Copy, Check, Terminal, Shield, Lock, Layers } from 'lucide-react';

export const CompactContractViewer: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const compactCode = `// ============================================================================
// MidZoll: Confidential Payroll & ZK Compliance Smart Contract
// Language: Midnight Compact DSL
// Target: Midnight Ledger (zk-SNARK state transitions)
// ============================================================================

include "std/ledger";

module MidZoll {

  // Private state kept off-chain on client device
  struct EmployeePrivateState {
    salary_amount_cents: Uint<64>,
    tax_rate_basis_pts: Uint<32>,
    viewing_key_hash: Bytes<32>,
    salt: Bytes<32>
  }

  // Public state committed to Midnight ledger
  export state {
    treasury_commitment: Bytes<32>,
    total_active_employees: Uint<32>,
    nullifier_root: Bytes<32>,
    aggregate_tax_remitted: Uint<64>
  }

  // Witness inputs provided during zero-knowledge proof generation
  witness fetch_employee_secret(): EmployeePrivateState;
  witness fetch_treasury_key(): Bytes<32>;

  /**
   * @notice Claim accrued pay stream into disposable stealth address
   */
  export circuit claim_payflow_stream(
    nullifier: Bytes<32>,
    stealth_recipient_pk: Bytes<32>,
    claim_amount_cents: Uint<64>
  ): Void {
    let emp = fetch_employee_secret();

    // Verify claim does not exceed private salary allowance
    assert claim_amount_cents <= emp.salary_amount_cents "Claim exceeds accrued stream balance";

    // Verify nullifier hasn't been spent
    assert !is_nullifier_spent(nullifier) "Double claim detected via nullifier";

    // Mark nullifier as spent in public ledger tree
    mark_nullifier_spent(nullifier);

    // Mint/transfer shielded tokens to stealth recipient
    shielded_transfer(stealth_recipient_pk, claim_amount_cents);
  }

  /**
   * @notice Generate verifiable Zero-Knowledge Income Proof credential
   */
  export circuit export_income_proof(
    min_required_monthly_cents: Uint<64>,
    auditor_pubkey: Bytes<32>
  ): Boolean {
    let emp = fetch_employee_secret();
    
    // ZK Constraint: Emp salary >= requested minimum threshold
    let satisfies_threshold = emp.salary_amount_cents >= min_required_monthly_cents;

    emit_zk_credential(auditor_pubkey, satisfies_threshold);

    return satisfies_threshold;
  }
}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(compactCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-blue-500/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2">
              <Terminal className="w-4 h-4" />
              <span>Native Midnight Compact Smart Contract</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white">
              Compact DSL <span className="text-gradient-cyan">Circuit Source</span>
            </h1>
            <p className="text-sm text-slate-300 mt-1">
              Inspecting <code className="text-cyan-300 bg-slate-900 px-2 py-0.5 rounded font-mono">midzoll.compact</code> - zero-knowledge state definition for Midnight blockchain.
            </p>
          </div>

          <button
            onClick={handleCopy}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold rounded-xl border border-slate-700 transition cursor-pointer flex items-center space-x-2 shrink-0"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy Compact Code'}</span>
          </button>
        </div>
      </div>

      {/* Code Display Container */}
      <div className="glass-panel rounded-2xl border border-indigo-900/40 overflow-hidden shadow-2xl">
        <div className="bg-slate-950 px-6 py-3 border-b border-indigo-900/40 flex items-center justify-between text-xs font-mono text-slate-400">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
            <span className="ml-2 text-slate-200">src/contracts/midzoll.compact</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-cyan-400">Target: Midnight Ledger</span>
            <span className="text-indigo-400">Compiler: compactc v0.12.1</span>
          </div>
        </div>

        <pre className="p-6 text-xs sm:text-sm font-mono text-slate-200 overflow-x-auto bg-slate-950/90 leading-relaxed selection:bg-cyan-500 selection:text-black">
          <code>{compactCode}</code>
        </pre>
      </div>
    </div>
  );
};
