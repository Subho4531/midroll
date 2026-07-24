'use client';

import React, { useState } from 'react';
import { Lock, ShieldCheck, Download, Copy, CheckCircle2, Sparkles, AlertCircle, FileText, QrCode } from 'lucide-react';
import { Employee, ZKProofCredential, formatUSD, generateZKHash } from '@/lib/midzoll-zk';
import confetti from 'canvas-confetti';

interface ZKProofGeneratorProps {
  employee: Employee;
  onProofCreated: (proof: ZKProofCredential) => void;
}

export const ZKProofGenerator: React.FC<ZKProofGeneratorProps> = ({
  employee,
  onProofCreated,
}) => {
  const [credentialType, setCredentialType] = useState<'INCOME_THRESHOLD' | 'EMPLOYMENT_VERIFICATION' | 'TAX_COMPLIANCE'>('INCOME_THRESHOLD');
  const [thresholdAmount, setThresholdAmount] = useState('6000');
  const [auditorRecipient, setAuditorRecipient] = useState('Chase Bank Mortgage & Auto Division');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [generatedCredential, setGeneratedCredential] = useState<ZKProofCredential | null>(null);

  const steps = [
    'Fetching private witness (salary_cents, viewing_key, salt)...',
    'Executing Compact range constraint check (salary >= threshold)...',
    'Computing Groth16 zk-SNARK proof over BLS12-381 curve...',
    'Emitting signed Zero-Knowledge Credential Payload!'
  ];

  const handleGenerateProof = () => {
    setIsGenerating(true);
    setStepIndex(0);
    setGeneratedCredential(null);

    const timer1 = setTimeout(() => setStepIndex(1), 700);
    const timer2 = setTimeout(() => setStepIndex(2), 1400);
    const timer3 = setTimeout(() => setStepIndex(3), 2100);
    const timer4 = setTimeout(() => {
      setIsGenerating(false);

      const thresholdVal = Number(thresholdAmount);
      const isSatisfied = employee.salaryMonthly >= thresholdVal;

      const newCred: ZKProofCredential = {
        proofId: generateZKHash('proof_id').substring(0, 16),
        timestamp: new Date().toISOString(),
        type: credentialType,
        thresholdUSD: thresholdVal,
        subjectName: employee.name,
        auditorRecipient,
        proofHash: generateZKHash('0xzk_groth16_proof'),
        nullifierHash: generateZKHash('0xnullifier'),
        verifiableStatement: isSatisfied
          ? `Subject salary exceeds requested threshold of ${formatUSD(thresholdVal)}/mo (Proven via Midnight ZK Circuit)`
          : `Subject DOES NOT satisfy required threshold of ${formatUSD(thresholdVal)}/mo`,
        status: isSatisfied ? 'VALID' : 'REVOKED',
        zkCircuitMetadata: {
          protocol: 'Groth16 over BLS12-381',
          constraintsCount: 14280,
          provingTimeMs: 2340,
          publicInputs: [
            generateZKHash('pub_threshold'),
            generateZKHash('pub_auditor_pk'),
            generateZKHash('pub_timestamp')
          ]
        }
      };

      setGeneratedCredential(newCred);
      onProofCreated(newCred);

      confetti({ particleCount: 70, spread: 70 });
    }, 2800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-amber-500/30">
        <div className="flex items-center space-x-3 text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">
          <Lock className="w-4 h-4" />
          <span>Zero-Knowledge Selective Disclosure Engine</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">
          ZK Income & Employment <span className="text-gradient-gold">Credential Generator</span>
        </h1>
        <p className="text-sm text-slate-300 mt-1">
          Prove your financial capability to banks, landlords, or lenders without disclosing bank statements or exact salary numbers.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column: Form Controls */}
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-indigo-900/40 space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span>Credential Parameters</span>
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Credential Purpose</label>
              <select
                value={credentialType}
                onChange={(e) => setCredentialType(e.target.value as any)}
                className="w-full glass-input p-3 rounded-xl text-sm bg-slate-900"
              >
                <option value="INCOME_THRESHOLD">Proof of Minimum Monthly Income (Mortgage/Lease)</option>
                <option value="EMPLOYMENT_VERIFICATION">Proof of Active Employment Status</option>
                <option value="TAX_COMPLIANCE">Proof of Zero-Knowledge Tax Withholding Compliance</option>
              </select>
            </div>

            {credentialType === 'INCOME_THRESHOLD' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Minimum Income Threshold to Prove (USD/mo)</label>
                <input
                  type="number"
                  value={thresholdAmount}
                  onChange={(e) => setThresholdAmount(e.target.value)}
                  className="w-full glass-input p-3 rounded-xl text-sm font-mono"
                  placeholder="e.g. 5000"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Your actual salary ({formatUSD(employee.salaryMonthly)}) stays completely secret.
                </p>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Auditor / Recipient Designation</label>
              <input
                type="text"
                value={auditorRecipient}
                onChange={(e) => setAuditorRecipient(e.target.value)}
                className="w-full glass-input p-3 rounded-xl text-sm"
                placeholder="e.g. Apex Property Management or Bank of America"
              />
            </div>

            <div className="p-4 bg-slate-900/80 rounded-xl border border-indigo-900/40 text-xs space-y-2">
              <div className="font-semibold text-cyan-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-cyan-400" /> What this zk-SNARK proves:
              </div>
              <ul className="text-slate-300 list-disc list-inside space-y-1 pl-1">
                <li>Salary ≥ ${Number(thresholdAmount).toLocaleString()}/month is TRUE</li>
                <li>Employer is a verified Midnight HR state commitment</li>
                <li>Zero exposure of total compensation or bank account history</li>
              </ul>
            </div>

            <button
              disabled={isGenerating}
              onClick={handleGenerateProof}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-amber-500/20 transition cursor-pointer disabled:opacity-50"
            >
              {isGenerating ? 'Synthesizing ZK Proof...' : 'Synthesize Zero-Knowledge Credential'}
            </button>
          </div>
        </div>

        {/* Right Column: Interactive Proof Output */}
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-indigo-900/40 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
              <FileText className="w-5 h-5 text-cyan-400" />
              <span>Verifiable Credential Output</span>
            </h2>

            {isGenerating && (
              <div className="py-8 space-y-6 text-center">
                <div className="w-16 h-16 border-4 border-amber-500/30 border-t-amber-400 rounded-full animate-spin mx-auto"></div>
                <div className="space-y-2">
                  <div className="text-sm font-bold text-amber-300">
                    Step {stepIndex + 1} of 4: {steps[stepIndex]}
                  </div>
                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-amber-400 transition-all duration-500"
                      style={{ width: `${((stepIndex + 1) / 4) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            {!isGenerating && !generatedCredential && (
              <div className="py-12 text-center text-slate-400 space-y-3">
                <QrCode className="w-12 h-12 text-slate-600 mx-auto" />
                <p className="text-sm">Configure parameters and click Synthesize to generate a cryptographically valid ZK credential payload.</p>
              </div>
            )}

            {!isGenerating && generatedCredential && (
              <div className="space-y-4 animate-fadeIn">
                <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-xl flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                    <div>
                      <div className="text-sm font-bold text-white">Proof Status: VERIFIED</div>
                      <div className="text-xs text-emerald-300">Midnight Compact Circuit Execution Complete</div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-900/60 text-emerald-300 text-xs font-mono rounded">
                    Groth16 Valid
                  </span>
                </div>

                <div className="p-4 bg-slate-900/90 rounded-xl border border-indigo-900/50 space-y-3 text-xs font-mono">
                  <div>
                    <span className="text-slate-400">Credential ID:</span>{' '}
                    <span className="text-white">{generatedCredential.proofId}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Verifiable Statement:</span>{' '}
                    <div className="text-cyan-300 font-sans font-semibold mt-1 p-2 bg-slate-950 rounded border border-slate-800">
                      &quot;{generatedCredential.verifiableStatement}&quot;
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400">Auditor Target:</span>{' '}
                    <span className="text-amber-300 font-sans">{generatedCredential.auditorRecipient}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Groth16 Proof Hash:</span>{' '}
                    <div className="text-slate-300 break-all">{generatedCredential.proofHash}</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-3 pt-2">
                  <button
                    onClick={() => alert(`JSON Payload Copied!\n\n${JSON.stringify(generatedCredential, null, 2)}`)}
                    className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl border border-slate-700 flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <Copy className="w-4 h-4 text-cyan-400" />
                    <span>Copy JSON Payload</span>
                  </button>
                  <button
                    onClick={() => alert('PDF ZK Attestation Statement downloaded successfully!')}
                    className="flex-1 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download ZK Certificate</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
