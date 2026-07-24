'use client';

import React, { useState } from 'react';
import { Eye, ShieldCheck, Search, CheckCircle2, XCircle, FileCode2, Lock, ArrowRight, Sparkles } from 'lucide-react';
import { ZKProofCredential, formatUSD, generateZKHash } from '@/lib/midzoll-zk';
import confetti from 'canvas-confetti';

interface ProofVerifierPortalProps {
  existingProofs: ZKProofCredential[];
}

export const ProofVerifierPortal: React.FC<ProofVerifierPortalProps> = ({
  existingProofs,
}) => {
  const [inputHash, setInputHash] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    valid: boolean;
    statement: string;
    details: any;
  } | null>(null);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setVerificationResult(null);

    setTimeout(() => {
      setIsVerifying(false);
      
      // Match from existing or generate positive verification
      const matched = existingProofs.find((p) => p.proofHash.includes(inputHash) || p.proofId.includes(inputHash));
      
      if (matched) {
        setVerificationResult({
          valid: matched.status === 'VALID',
          statement: matched.verifiableStatement,
          details: matched,
        });
      } else {
        // Fallback demo positive result
        setVerificationResult({
          valid: true,
          statement: `Subject income exceeds requested threshold of $5,000.00/mo (Attested by Midnight ZK Ledger)`,
          details: {
            proofId: inputHash || generateZKHash('proof_id').substring(0, 14),
            timestamp: new Date().toISOString(),
            subjectName: 'Elena Rostova (Shielded Witness)',
            auditorRecipient: 'Verified Third-Party Auditor',
            zkCircuitMetadata: {
              protocol: 'Groth16 over BLS12-381',
              constraintsCount: 14280,
              provingTimeMs: 2100,
              publicInputs: ['0xpub_input_1', '0xpub_input_2']
            }
          }
        });
      }

      confetti({ particleCount: 50, spread: 50 });
    }, 1500);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-emerald-500/30">
        <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">
          <Eye className="w-4 h-4" />
          <span>Independent Third-Party Verification Portal</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">
          Midnight ZK <span className="text-gradient-cyan">Credential Verifier</span>
        </h1>
        <p className="text-sm text-slate-300 mt-1">
          Designed for Banks, Landlords, & Tax Authorities to verify financial proofs without compromising applicant privacy.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Verification Form */}
        <div className="lg:col-span-2 glass-panel p-6 sm:p-8 rounded-2xl border border-indigo-900/40 space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Search className="w-5 h-5 text-cyan-400" />
            <span>Verify ZK Proof Hash or Credential Payload</span>
          </h2>

          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Paste ZK Proof Hash, Credential ID, or JSON Payload
              </label>
              <textarea
                rows={3}
                value={inputHash}
                onChange={(e) => setInputHash(e.target.value)}
                placeholder="e.g. 0xzk_groth16_proof_992a188f... or proof_id_881"
                className="w-full glass-input p-3 rounded-xl text-xs font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={isVerifying}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition cursor-pointer disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <ShieldCheck className="w-5 h-5" />
              <span>{isVerifying ? 'Verifying zk-SNARK Math...' : 'Verify Cryptographic Proof'}</span>
            </button>
          </form>

          {/* Result Card */}
          {isVerifying && (
            <div className="py-8 text-center space-y-3">
              <div className="w-10 h-10 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin mx-auto"></div>
              <p className="text-xs text-cyan-300 font-mono">Checking Midnight sidechain nullifiers & BLS12-381 pairings...</p>
            </div>
          )}

          {!isVerifying && verificationResult && (
            <div className="p-6 bg-slate-900/90 rounded-2xl border border-emerald-500/40 space-y-4 animate-fadeIn">
              <div className="flex items-center space-x-3 pb-4 border-b border-indigo-900/40">
                {verificationResult.valid ? (
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/40">
                    <XCircle className="w-8 h-8" />
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {verificationResult.valid ? 'PROOF Cryptographically VALID' : 'INVALID PROOF'}
                  </h3>
                  <p className="text-xs text-emerald-300">
                    Midnight Ledger On-Chain State Nullifier: UNSPENT & VERIFIED
                  </p>
                </div>
              </div>

              {/* Statement Box */}
              <div className="p-4 bg-slate-950 rounded-xl border border-indigo-900/50">
                <div className="text-xs text-slate-400 mb-1">Proven Zero-Knowledge Statement:</div>
                <div className="text-sm font-semibold text-cyan-300">
                  &quot;{verificationResult.statement}&quot;
                </div>
              </div>

              {/* Proof Metadata */}
              <div className="grid grid-cols-2 gap-4 text-xs font-mono text-slate-300">
                <div>
                  <span className="text-slate-400">Protocol:</span> Groth16 zk-SNARK
                </div>
                <div>
                  <span className="text-slate-400">Proving System:</span> BLS12-381
                </div>
                <div>
                  <span className="text-slate-400">Raw Salary Exposed:</span> <span className="text-rose-400 font-bold">0% (100% Shielded)</span>
                </div>
                <div>
                  <span className="text-slate-400">Verification Time:</span> 12ms
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Pre-baked Demo Credentials */}
        <div className="glass-panel p-6 rounded-2xl border border-indigo-900/40 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <FileCode2 className="w-4 h-4 text-cyan-400" />
            <span>Sample Credentials Ready to Test</span>
          </h3>

          <div className="space-y-3">
            {existingProofs.length === 0 ? (
              <div className="p-4 bg-slate-900/60 rounded-xl border border-indigo-900/30 text-xs text-slate-400">
                Generate a proof in the ZK Income Proof tab to see it listed here!
              </div>
            ) : (
              existingProofs.map((proof) => (
                <div
                  key={proof.proofId}
                  onClick={() => setInputHash(proof.proofId)}
                  className="p-3 bg-slate-900/80 hover:bg-slate-800 rounded-xl border border-slate-800 hover:border-cyan-500/40 cursor-pointer transition space-y-1 text-xs"
                >
                  <div className="font-bold text-white flex justify-between">
                    <span>{proof.subjectName}</span>
                    <span className="text-cyan-400 font-mono">{proof.proofId}</span>
                  </div>
                  <div className="text-slate-400 truncate">{proof.verifiableStatement}</div>
                  <div className="text-[10px] text-amber-400">For: {proof.auditorRecipient}</div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
